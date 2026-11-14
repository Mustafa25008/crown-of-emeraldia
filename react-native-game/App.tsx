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
  BackHandler,
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
import { GameState } from './src/game/types';

const NATIVE_STORAGE_KEY = 'crown_of_emeraldia_save_v2';

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

function GameHostApp() {
  const webViewRef = useRef<WebView<{}> | null>(null);
  const [currentGameState, setCurrentGameState] = useState<GameState>('TITLE_MENU');
  const [isAtRoot, setIsAtRoot] = useState<boolean>(true);
  const [isEngineReady, setIsEngineReady] = useState<boolean>(false);
  const [isAdMobReady, setIsAdMobReady] = useState<boolean>(false);
  const lastRootBackPressRef = useRef<number>(0);
  const currentOrientationRef = useRef<'landscape' | 'portrait'>('portrait');

  // Banner Ad is visible on mobile menu screens and strictly hidden during active gameplay
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

  // Ensure native splash screen hides reliably even if WebView onLoadEnd is delayed
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setIsEngineReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 600);
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Hide native splash screen and initialize AdMob SDK only after the WebView engine is ready
  useEffect(() => {
    if (!isEngineReady) return;

    SplashScreen.hideAsync().catch(() => {});

    let cancelled = false;
    const adInitTimer = setTimeout(() => {
      initializeAdMobSdk()
        .then((ready) => {
          if (!cancelled && ready) {
            setIsAdMobReady(true);
          }
        })
        .catch(() => {});
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(adInitTimer);
    };
  }, [isEngineReady]);

  // Hydrate saved progress from React Native AsyncStorage when WebView loads
  const handleWebViewLoadEnd = useCallback(async () => {
    try {
      const savedJson = await AsyncStorage.getItem(NATIVE_STORAGE_KEY);
      if (savedJson && webViewRef.current) {
        webViewRef.current.injectJavaScript(buildHydrateSaveScript(savedJson));
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setIsEngineReady(true);
    }
  }, []);

  // Native Android Hardware & Gesture Back Button Handler
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = (): boolean => {
      // If not on the Home Screen (TITLE_MENU), route Back press into the game's screen navigation / pause system
      if (!isAtRoot || currentGameState !== 'TITLE_MENU') {
        webViewRef.current?.injectJavaScript(buildAndroidBackPressScript());
        return true;
      }

      // Already on Home Screen: require double-press within 2 seconds to exit cleanly
      const now = Date.now();
      if (now - lastRootBackPressRef.current < 2000) {
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
          setIsEngineReady(true);
          break;
        }
        case 'SET_ORIENTATION': {
          await applyNativeOrientation(msg.orientation);
          break;
        }
        case 'GAME_STATE_CHANGE': {
          setCurrentGameState(msg.gameState);
          setIsAtRoot(msg.isAtRoot);
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
            await AsyncStorage.setItem(NATIVE_STORAGE_KEY, JSON.stringify(msg.saveData));
          } catch {
            // Ignore write errors
          }
          break;
        }
        case 'SHOW_REWARDED_AD': {
          const result = await showRewardedReviveAd();
          webViewRef.current?.injectJavaScript(
            buildRewardedAdResultScript(result.rewarded)
          );
          break;
        }
        case 'BACK_AT_ROOT': {
          if (Platform.OS === 'android') {
            const now = Date.now();
            if (now - lastRootBackPressRef.current < 2000) {
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
    [applyNativeOrientation]
  );

  const handleRootLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container} onLayout={handleRootLayout}>
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
        onError={() => setIsEngineReady(true)}
        onHttpError={() => setIsEngineReady(true)}
        onMessage={handleWebViewMessage}
      />
      {/* Native Google AdMob Banner Ad in the bottom menu slot (strictly hidden during active gameplay) */}
      <AdBannerSlot visible={isMenuScreen && isEngineReady} sdkReady={isAdMobReady} />
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
    backgroundColor: '#020617',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
  webview: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
