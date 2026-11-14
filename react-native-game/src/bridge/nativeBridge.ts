import { GameState, SaveProgress } from '../game/types';

export type NativeBridgeInboundMessage =
  | {
      type: 'GAME_STATE_CHANGE';
      gameState: GameState;
      isAtRoot: boolean;
    }
  | {
      type: 'SET_ORIENTATION';
      orientation: 'landscape' | 'portrait';
    }
  | {
      type: 'SAVE_PROGRESS_SYNC';
      saveData: SaveProgress;
    }
  | {
      type: 'SHOW_REWARDED_AD';
      levelId?: number;
    }
  | {
      type: 'BACK_AT_ROOT';
    }
  | {
      type: 'ENGINE_READY';
    };

/**
 * Injected prior to content load inside the hardware-accelerated React Native WebView:
 * - Disables pinch-to-zoom, long-press callouts, and overscroll rubber-banding for a 100% native arcade feel.
 * - Exposes window.AndroidBridge.setOrientation for legacy & modern orientation bridges.
 * - Signals ENGINE_READY as soon as the first animation frame completes so the native Expo splash screen hides cleanly.
 */
export const INJECTED_NATIVE_BRIDGE_JS = `
(function() {
  try {
    document.documentElement.style.webkitTouchCallout = 'none';
    document.documentElement.style.webkitUserSelect = 'none';
    document.documentElement.style.userSelect = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    window.addEventListener('contextmenu', function(e) { e.preventDefault(); }, { passive: false });
    window.addEventListener('gesturestart', function(e) { e.preventDefault(); }, { passive: false });

    window.AndroidBridge = {
      setOrientation: function(mode) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SET_ORIENTATION',
            orientation: mode === 'landscape' ? 'landscape' : 'portrait'
          }));
        }
      }
    };

    window.addEventListener('DOMContentLoaded', function() {
      requestAnimationFrame(function() {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ENGINE_READY' }));
        }
      });
    });
  } catch (err) {}
})();
true;
`;

export function buildAndroidBackPressScript(): string {
  return `
    (function() {
      try {
        if (typeof window.__handleAndroidBackPress === 'function') {
          window.__handleAndroidBackPress();
        } else {
          window.postMessage(JSON.stringify({ type: 'ANDROID_BACK_PRESS' }), '*');
        }
      } catch (e) {}
    })();
    true;
  `;
}

export function buildHydrateSaveScript(rawSaveJson: string): string {
  const escaped = JSON.stringify(rawSaveJson);
  return `
    (function() {
      try {
        var parsed = JSON.parse(${escaped});
        localStorage.setItem('crown_of_emeraldia_save_v2', JSON.stringify(parsed));
        window.postMessage(JSON.stringify({ type: 'HYDRATE_NATIVE_SAVE', saveData: parsed }), '*');
      } catch (e) {}
    })();
    true;
  `;
}

export function buildRewardedAdResultScript(rewarded: boolean): string {
  const flag = rewarded ? 'true' : 'false';
  return `
    (function() {
      try {
        if (typeof window.__onNativeRewardedAdResult === 'function') {
          window.__onNativeRewardedAdResult(${flag});
        } else {
          window.postMessage(JSON.stringify({ type: 'REWARDED_AD_RESULT', rewarded: ${flag} }), '*');
        }
      } catch (e) {}
    })();
    true;
  `;
}

export function parseBridgeMessage(rawData: string): NativeBridgeInboundMessage | null {
  try {
    const parsed = JSON.parse(rawData);
    if (!parsed || typeof parsed.type !== 'string') return null;
    return parsed as NativeBridgeInboundMessage;
  } catch {
    return null;
  }
}
