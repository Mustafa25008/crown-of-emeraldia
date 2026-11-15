import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getRewardedAdUnitId } from './admobConfig';

type AdMobModuleType = typeof import('react-native-google-mobile-ads');
type RewardedAdInstance = import('react-native-google-mobile-ads').RewardedAd;

let cachedAdMobModule: AdMobModuleType | null = null;
let adMobLoadAttempted = false;
let isSdkInitialized = false;
let initPromise: Promise<boolean> | null = null;
let preloadedRewardedAd: RewardedAdInstance | null = null;
let isPreloadedAdReady = false;

/**
 * Safely lazy-loads `react-native-google-mobile-ads` only when needed and outside Expo Go.
 * Prevents top-level `TurboModuleRegistry.getEnforcing` crashes during cold start in
 * standalone preview/production APKs and allows running in Expo Go without crashing.
 */
export function getSafeAdMobModule(): AdMobModuleType | null {
  if (Platform.OS === 'web') {
    return null;
  }
  if (Constants.executionEnvironment === 'storeClient') {
    // Running inside standard Expo Go where custom native AdMob binaries are unavailable
    return null;
  }
  if (adMobLoadAttempted) {
    return cachedAdMobModule;
  }
  adMobLoadAttempted = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-google-mobile-ads') as AdMobModuleType;
    if (mod && typeof mod.default === 'function') {
      cachedAdMobModule = mod;
      return mod;
    }
  } catch {
    cachedAdMobModule = null;
  }
  return null;
}

function createAndLoadRewardedAd(): void {
  if (Platform.OS === 'web' || !isSdkInitialized) return;
  const adMob = getSafeAdMobModule();
  if (!adMob) return;

  try {
    const { RewardedAd, RewardedAdEventType, AdEventType } = adMob;
    const unitId = getRewardedAdUnitId();
    const rewarded = RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    isPreloadedAdReady = false;

    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isPreloadedAdReady = true;
    });

    rewarded.addAdEventListener(AdEventType.ERROR, () => {
      isPreloadedAdReady = false;
    });

    preloadedRewardedAd = rewarded;
    rewarded.load();
  } catch {
    preloadedRewardedAd = null;
    isPreloadedAdReady = false;
  }
}

export async function initializeAdMobSdk(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (isSdkInitialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const adMob = getSafeAdMobModule();
    if (!adMob) {
      return false;
    }
    try {
      const mobileAds = adMob.default;
      await mobileAds().initialize();
      isSdkInitialized = true;
      setTimeout(() => {
        createAndLoadRewardedAd();
      }, 300);
      return true;
    } catch {
      isSdkInitialized = false;
      return false;
    }
  })();

  return initPromise;
}

export interface RewardedAdResult {
  rewarded: boolean;
  error?: string;
}

const AD_UNAVAILABLE_MESSAGE =
  'Ad unavailable. Please check your connection or disable ad blocker to revive!';
const AD_CLOSED_EARLY_MESSAGE =
  'Reward not earned. Please watch the full ad to revive!';
const AD_LOAD_TIMEOUT_MS = 10000;

/**
 * Displays the Google AdMob Rewarded Ad for the "Watch Ad & Revive" feature.
 * STRICT VALIDATION:
 * - Resolves with `{ rewarded: true }` ONLY when `RewardedAdEventType.EARNED_REWARD` (`onAdRewarded`) fires.
 * - If the SDK is unavailable, ad fails to load, device is offline, an ad blocker blocks AdMob,
 *   or the user closes the ad before earning the reward, resolves with `{ rewarded: false, error }`.
 */
export async function showRewardedReviveAd(): Promise<RewardedAdResult> {
  if (Platform.OS === 'web') {
    return {
      rewarded: false,
      error: AD_UNAVAILABLE_MESSAGE,
    };
  }

  const ready = await initializeAdMobSdk();
  const adMob = getSafeAdMobModule();
  if (!ready || !adMob) {
    return {
      rewarded: false,
      error: AD_UNAVAILABLE_MESSAGE,
    };
  }

  return new Promise((resolve) => {
    let settled = false;
    let adOpened = false;
    let earnedReward = false;
    let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearLoadTimeout = () => {
      if (loadTimeoutId !== null) {
        clearTimeout(loadTimeoutId);
        loadTimeoutId = null;
      }
    };

    const finish = (rewarded: boolean, error?: string) => {
      if (settled) return;
      settled = true;
      clearLoadTimeout();
      createAndLoadRewardedAd();
      // Strict guard: never grant revive reward unless the ad actually opened AND earned the reward
      if (rewarded && (!adOpened || !earnedReward)) {
        resolve({ rewarded: false, error: AD_UNAVAILABLE_MESSAGE });
        return;
      }
      resolve({ rewarded, error });
    };

    try {
      const { RewardedAd, RewardedAdEventType, AdEventType } = adMob;
      const unitId = getRewardedAdUnitId();
      const usePreloaded = Boolean(preloadedRewardedAd && isPreloadedAdReady);
      const adInstance = usePreloaded
        ? (preloadedRewardedAd as RewardedAdInstance)
        : RewardedAd.createForAdRequest(unitId, {
            requestNonPersonalizedAdsOnly: true,
          });

      let unsubLoaded: (() => void) | null = null;

      const cleanupListeners = () => {
        try {
          unsubOpened();
          unsubEarned();
          unsubClosed();
          unsubError();
          if (unsubLoaded) {
            unsubLoaded();
            unsubLoaded = null;
          }
        } catch {
          // Ignore listener cleanup errors
        }
      };

      const unsubOpened = adInstance.addAdEventListener(AdEventType.OPENED, () => {
        adOpened = true;
        clearLoadTimeout();
      });

      const unsubEarned = adInstance.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          if (reward) {
            earnedReward = true;
          }
        }
      );

      const unsubClosed = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
        cleanupListeners();
        if (adOpened && earnedReward) {
          finish(true);
        } else if (adOpened && !earnedReward) {
          finish(false, AD_CLOSED_EARLY_MESSAGE);
        } else {
          finish(false, AD_UNAVAILABLE_MESSAGE);
        }
      });

      const unsubError = adInstance.addAdEventListener(AdEventType.ERROR, () => {
        cleanupListeners();
        finish(false, AD_UNAVAILABLE_MESSAGE);
      });

      if (usePreloaded) {
        isPreloadedAdReady = false;
        preloadedRewardedAd = null;
        loadTimeoutId = setTimeout(() => {
          if (!adOpened) {
            cleanupListeners();
            finish(false, AD_UNAVAILABLE_MESSAGE);
          }
        }, 5000);
        adInstance.show().catch(() => {
          cleanupListeners();
          finish(false, AD_UNAVAILABLE_MESSAGE);
        });
      } else {
        loadTimeoutId = setTimeout(() => {
          cleanupListeners();
          finish(false, AD_UNAVAILABLE_MESSAGE);
        }, AD_LOAD_TIMEOUT_MS);

        unsubLoaded = adInstance.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => {
            clearLoadTimeout();
            if (unsubLoaded) {
              unsubLoaded();
              unsubLoaded = null;
            }
            loadTimeoutId = setTimeout(() => {
              if (!adOpened) {
                cleanupListeners();
                finish(false, AD_UNAVAILABLE_MESSAGE);
              }
            }, 5000);
            adInstance.show().catch(() => {
              cleanupListeners();
              finish(false, AD_UNAVAILABLE_MESSAGE);
            });
          }
        );

        adInstance.load();
      }
    } catch {
      finish(false, AD_UNAVAILABLE_MESSAGE);
    }
  });
}

