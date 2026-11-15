import React, {
  Component,
  ErrorInfo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  AppStateStatus,
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  ToastAndroid,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { AdBannerSlot } from './src/ads/AdBannerSlot';
import {
  initializeAdMobSdk,
  showRewardedReviveAd,
} from './src/ads/rewardedAdManager';
import {
  INJECTED_NATIVE_BRIDGE_JS,
  buildAndroidBackPressScript,
  buildHydrateSaveScript,
  buildRewardedAdResultScript,
  parseBridgeMessage,
} from './src/bridge/nativeBridge';
import { INLINE_GAME_HTML } from './src/bundle/inlineGameHtml';
import {
  DEFAULT_SAVE,
  STORAGE_KEY,
  STORAGE_KEY_V2,
  mergeSaveProgress,
} from './src/game/storage';
import { GameState, SaveProgress } from './src/game/types';

const SPLASH_LAUNCH_DURATION_MS = 1100;

// Keep native Android 12+ androidx.core:core-splashscreen visible until React Native mounts its identical splash overlay
SplashScreen.preventAutoHideAsync().catch(() => {});

interface RootErrorBoundaryState {
  hasError: boolean;
}

class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    SplashScreen.hideAsync().catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return <View style={styles.container} />;
    }
    return this.props.children;
  }
}

function parseSavedJson(raw: string | null): Partial<SaveProgress> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<SaveProgress>;
  } catch {
    return null;
  }
}

function GameHostApp() {
  const webViewRef = useRef<WebView<{}> | null>(null);
  const [currentGameState, setCurrentGameState] = useState<GameState>('TITLE_MENU');
  const currentGameStateRef = useRef<GameState>('TITLE_MENU');
  const [isAtRoot, setIsAtRoot] = useState<boolean>(true);
  const [isEngineReady, setIsEngineReady] = useState<boolean>(false);
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);
  const [isAdMobReady, setIsAdMobReady] = useState<boolean>(false);
  const [bannerRefreshKey, setBannerRefreshKey] = useState<string>('TITLE_MENU-0');

  const lastRootBackPressRef = useRef<number>(0);
  const currentOrientationRef = useRef<'landscape' | 'portrait'>('portrait');
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isShowingRewardedAdRef = useRef<boolean>(false);
  const shouldRunSplashOnResumeRef = useRef<boolean>(false);

  // Non-destructive persistent save cache in memory to prevent any race condition overwriting AsyncStorage
  const nativeSaveRef = useRef<SaveProgress>({
    ...DEFAULT_SAVE,
    highScores: {},
    bestCoins: {},
  });
  const isNativeSaveLoadedRef = useRef<boolean>(false);

  // Banner Ad is visible on mobile menu screens (once splash finishes) and strictly hidden during active gameplay
  const isMenuScreen = useMemo(() => {
    return (
      currentGameState === 'TITLE_MENU' ||
      currentGameState === 'WORLD_SELECT' ||
      currentGameState === 'LEVEL_SELECT' ||
      currentGameState === 'SETTINGS_HUB' ||
      currentGameState === 'SETTINGS' ||
      currentGameState === 'CONTROLS'
    );
  }, [currentGameState]);

  const scheduleSplashDismiss = useCallback((durationMs: number = SPLASH_LAUNCH_DURATION_MS) => {
    if (splashTimerRef.current !== null) {
      clearTimeout(splashTimerRef.current);
    }
    SplashScreen.hideAsync().catch(() => {});
    splashTimerRef.current = setTimeout(() => {
      splashTimerRef.current = null;
      setIsSplashVisible(false);
    }, durationMs);
  }, []);

  const triggerLaunchSplashSequence = useCallback(
    (durationMs: number = SPLASH_LAUNCH_DURATION_MS) => {
      setIsSplashVisible(true);
      scheduleSplashDismiss(durationMs);
    },
    [scheduleSplashDismiss]
  );

  useEffect(() => {
    return () => {
      if (splashTimerRef.current !== null) {
        clearTimeout(splashTimerRef.current);
      }
    };
  }, []);

  // Load and non-destructively merge saved progress from AsyncStorage (both v1 and v2 keys)
  const loadAndHydrateNativeSave = useCallback(async () => {
    try {
      const [rawV2, rawV1] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_V2),
        AsyncStorage.getItem(STORAGE_KEY),
      ]);
      const parsedV2 = parseSavedJson(rawV2);
      const parsedV1 = parseSavedJson(rawV1);

      let merged = mergeSaveProgress(nativeSaveRef.current, parsedV1);
      merged = mergeSaveProgress(merged, parsedV2);
      nativeSaveRef.current = merged;
      isNativeSaveLoadedRef.current = true;

      const serialized = JSON.stringify(merged);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_V2, serialized),
        AsyncStorage.setItem(STORAGE_KEY, serialized),
      ]);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(buildHydrateSaveScript(serialized));
      }
    } catch {
      isNativeSaveLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    loadAndHydrateNativeSave();
  }, [loadAndHydrateNativeSave]);

  const markEngineReadyAndRunSplash = useCallback(() => {
    setIsEngineReady(true);
    SplashScreen.hideAsync().catch(() => {});
    scheduleSplashDismiss(SPLASH_LAUNCH_DURATION_MS);
  }, [scheduleSplashDismiss]);

  const applyNativeOrientation = useCallback(async (mode: 'landscape' | 'portrait') => {
    if (Platform.OS === 'web') return;
    if (currentOrientationRef.current === mode) return;
    currentOrientationRef.current = mode;

    try {
      if (mode === 'landscape') {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden').catch(() => {});
        }
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    } catch {
      // Orientation lock is a no-op on unsupported devices/simulators
    }
  }, []);

  // Initialize AdMob SDK once engine is ready
  useEffect(() => {
    if (!isEngineReady) return;

    SplashScreen.hideAsync().catch(() => {});

    let cancelled = false;
    initializeAdMobSdk()
      .then((ready) => {
        if (!cancelled && ready) {
          setIsAdMobReady(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isEngineReady]);

  // Re-run Splash Screen sequence when app is re-opened from Home Screen / Launcher after backgrounding on TITLE_MENU or Back-exit
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (isShowingRewardedAdRef.current) {
        return;
      }

      if (nextState === 'background') {
        // If user minimized/exited while on the Home Screen (TITLE_MENU), show Splash Screen on next launch
        if (currentGameStateRef.current === 'TITLE_MENU') {
          shouldRunSplashOnResumeRef.current = true;
          setIsSplashVisible(true);
        }
      } else if (
        (prevState === 'background' || prevState === 'inactive') &&
        nextState === 'active'
      ) {
        // Always re-hydrate save progress non-destructively on resume
        loadAndHydrateNativeSave();

        if (shouldRunSplashOnResumeRef.current || currentGameStateRef.current === 'TITLE_MENU') {
          shouldRunSplashOnResumeRef.current = false;
          triggerLaunchSplashSequence(SPLASH_LAUNCH_DURATION_MS);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadAndHydrateNativeSave, triggerLaunchSplashSequence]);

  // Hydrate saved progress from React Native AsyncStorage when WebView loads and start cold-launch splash sequence
  const handleWebViewLoadEnd = useCallback(async () => {
    await loadAndHydrateNativeSave();
    markEngineReadyAndRunSplash();
  }, [loadAndHydrateNativeSave, markEngineReadyAndRunSplash]);

  // Native Android Hardware & Gesture Back Button Handler
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = (): boolean => {
      if (!isAtRoot || currentGameState !== 'TITLE_MENU') {
        webViewRef.current?.injectJavaScript(buildAndroidBackPressScript());
        return true;
      }

      // Already on Home Screen: require double-press within 2 seconds to exit cleanly
      const now = Date.now();
      if (now - lastRootBackPressRef.current < 2000) {
        shouldRunSplashOnResumeRef.current = true;
        setIsSplashVisible(true);
        BackHandler.exitApp();
        return true;
      }

      lastRootBackPressRef.current = now;
      ToastAndroid.show('Press Back again to exit Crown of Emeraldia', ToastAndroid.SHORT);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => subscription.remove();
  }, [currentGameState, isAtRoot]);

  // Handle inbound messages from the game engine
  const handleWebViewMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const msg = parseBridgeMessage(event.nativeEvent.data);
      if (!msg) return;

      switch (msg.type) {
        case 'ENGINE_READY': {
          await loadAndHydrateNativeSave();
          markEngineReadyAndRunSplash();
          break;
        }
        case 'SET_ORIENTATION': {
          await applyNativeOrientation(msg.orientation);
          break;
        }
        case 'GAME_STATE_CHANGE': {
          currentGameStateRef.current = msg.gameState;
          setCurrentGameState(msg.gameState);
          setIsAtRoot(msg.isAtRoot);
          setBannerRefreshKey(msg.refreshKey || `${msg.gameState}-${Date.now()}`);
          const isGameplay =
            msg.gameState === 'PLAYING' ||
            msg.gameState === 'PAUSED' ||
            msg.gameState === 'LEVEL_COMPLETE' ||
            msg.gameState === 'GAME_OVER' ||
            msg.gameState === 'TIME_OUT' ||
            msg.gameState === 'WORLD_VICTORY';
          await applyNativeOrientation(isGameplay ? 'landscape' : 'portrait');
          break;
        }
        case 'SAVE_PROGRESS_SYNC': {
          try {
            if (!isNativeSaveLoadedRef.current) {
              await loadAndHydrateNativeSave();
            }
            // Non-destructively merge incoming save data with existing native save so progress is NEVER lost
            const merged = mergeSaveProgress(nativeSaveRef.current, msg.saveData);
            nativeSaveRef.current = merged;
            const serialized = JSON.stringify(merged);
            await Promise.all([
              AsyncStorage.setItem(STORAGE_KEY_V2, serialized),
              AsyncStorage.setItem(STORAGE_KEY, serialized),
            ]);
          } catch {
            // Ignore write errors
          }
          break;
        }
        case 'RESET_NATIVE_SAVE': {
          try {
            const fresh: SaveProgress = {
              ...DEFAULT_SAVE,
              highScores: {},
              bestCoins: {},
            };
            nativeSaveRef.current = fresh;
            const serialized = JSON.stringify(fresh);
            await Promise.all([
              AsyncStorage.setItem(STORAGE_KEY_V2, serialized),
              AsyncStorage.setItem(STORAGE_KEY, serialized),
            ]);
          } catch {
            // Ignore write errors
          }
          break;
        }
        case 'SHOW_REWARDED_AD': {
          isShowingRewardedAdRef.current = true;
          try {
            const result = await showRewardedReviveAd();
            webViewRef.current?.injectJavaScript(
              buildRewardedAdResultScript(result.rewarded, result.error)
            );
          } finally {
            setTimeout(() => {
              isShowingRewardedAdRef.current = false;
            }, 400);
          }
          break;
        }
        case 'BACK_AT_ROOT': {
          if (Platform.OS === 'android') {
            const now = Date.now();
            if (now - lastRootBackPressRef.current < 2000) {
              shouldRunSplashOnResumeRef.current = true;
              setIsSplashVisible(true);
              BackHandler.exitApp();
            } else {
              lastRootBackPressRef.current = now;
              ToastAndroid.show('Press Back again to exit Crown of Emeraldia', ToastAndroid.SHORT);
            }
          }
          break;
        }
      }
    },
    [applyNativeOrientation, loadAndHydrateNativeSave, markEngineReadyAndRunSplash]
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: INLINE_GAME_HTML, baseUrl: 'https://emeraldia.local/' }}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        androidLayerType="hardware"
        overScrollMode="never"
        bounces={false}
        scrollEnabled={false}
        scalesPageToFit={false}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        injectedJavaScriptBeforeContentLoaded={INJECTED_NATIVE_BRIDGE_JS}
        onLoadEnd={handleWebViewLoadEnd}
        onError={markEngineReadyAndRunSplash}
        onHttpError={markEngineReadyAndRunSplash}
        onMessage={handleWebViewMessage}
      />
      {/* Cold-Start & Home-Re-Entry Splash Screen Overlay */}
      {(!isEngineReady || isSplashVisible) && (
        <View style={styles.coldStartSplashOverlay} pointerEvents="auto">
          <Image
            source={require('./assets/splash-icon.png')}
            style={styles.coldStartSplashImage}
            resizeMode="cover"
          />
        </View>
      )}
      {/* Native Google AdMob Banner Ad overlaid transparently on the bottom environment ground (refreshes on every screen change; hidden during gameplay and splash) */}
      <AdBannerSlot
        visible={isMenuScreen && isEngineReady && !isSplashVisible}
        sdkReady={isAdMobReady}
        refreshKey={bannerRefreshKey}
      />
    </View>
  );
}

export default function App() {
  return (
    <RootErrorBoundary>
      <GameHostApp />
    </RootErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#48C3F7',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#48C3F7',
  },
  webview: {
    flex: 1,
    backgroundColor: '#48C3F7',
  },
  coldStartSplashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#48C3F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  coldStartSplashImage: {
    width: '100%',
    height: '100%',
  },
});
