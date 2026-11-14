import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  INJECTED_NATIVE_BRIDGE_JS,
  buildAndroidBackPressScript,
  buildHydrateSaveScript,
  parseBridgeMessage,
} from './src/bridge/nativeBridge';
import { INLINE_GAME_HTML } from './src/bundle/inlineGameHtml';
import { GameState } from './src/game/types';

const NATIVE_STORAGE_KEY = 'crown_of_emeraldia_save_v2';

// Prevent native splash screen from auto-hiding before the 60FPS Canvas Engine mounts
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const webViewRef = useRef<WebView<{}> | null>(null);
  const [currentGameState, setCurrentGameState] = useState<GameState>('TITLE_MENU');
  const [isAtRoot, setIsAtRoot] = useState<boolean>(true);
  const [isEngineReady, setIsEngineReady] = useState<boolean>(false);
  const lastRootBackPressRef = useRef<number>(0);

  const applyNativeOrientation = useCallback(async (mode: 'landscape' | 'portrait') => {
    try {
      if (mode === 'landscape') {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden');
        }
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden');
        }
      }
    } catch {
      // Orientation lock is a no-op on unsupported simulators
    }
  }, []);

  // Lock to Portrait on initial startup
  useEffect(() => {
    applyNativeOrientation('portrait');
  }, [applyNativeOrientation]);

  // Hide native splash screen once the 60FPS engine signals readiness
  useEffect(() => {
    if (isEngineReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
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
        onMessage={handleWebViewMessage}
      />
    </View>
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
