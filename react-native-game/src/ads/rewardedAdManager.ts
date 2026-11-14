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

/**
 * Displays the Google AdMob Rewarded Ad for the "Watch Ad & Revive" feature.
 * Resolves with `{ rewarded: true }` once the user earns the reward (or if offline test fallback activates),
 * or `{ rewarded: false }` if the user dismisses the ad early before earning the reward.
 */
export async function showRewardedReviveAd(): Promise<{ rewarded: boolean }> {
  if (Platform.OS === 'web') {
    return { rewarded: true };
  }

  const ready = await initializeAdMobSdk();
  const adMob = getSafeAdMobModule();
  if (!ready || !adMob) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ rewarded: true }), 800);
    });
  }

  return new Promise((resolve) => {
    let settled = false;
    let earnedReward = false;

    const finish = (rewarded: boolean) => {
      if (settled) return;
      settled = true;
      createAndLoadRewardedAd();
      resolve({ rewarded });
    };

    try {
      const { RewardedAd, RewardedAdEventType, AdEventType } = adMob;
      const unitId = getRewardedAdUnitId();
      const adInstance =
        preloadedRewardedAd && isPreloadedAdReady
          ? preloadedRewardedAd
          : RewardedAd.createForAdRequest(unitId, {
              requestNonPersonalizedAdsOnly: true,
            });

      const unsubEarned = adInstance.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earnedReward = true;
        }
      );

      const unsubClosed = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        unsubError();
        finish(earnedReward);
      });

      const unsubError = adInstance.addAdEventListener(AdEventType.ERROR, () => {
        unsubEarned();
        unsubClosed();
        unsubError();
        setTimeout(() => finish(true), 900);
      });

      if (adInstance === preloadedRewardedAd && isPreloadedAdReady) {
        isPreloadedAdReady = false;
        adInstance.show().catch(() => {
          finish(true);
        });
      } else {
        const unsubLoaded = adInstance.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => {
            unsubLoaded();
            adInstance.show().catch(() => {
              finish(true);
            });
          }
        );
        adInstance.load();
      }
    } catch {
      setTimeout(() => finish(true), 900);
    }
  });
}
