import { Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { getRewardedAdUnitId } from './admobConfig';

let isSdkInitialized = false;
let preloadedRewardedAd: RewardedAd | null = null;
let isPreloadedAdReady = false;

function createAndLoadRewardedAd(): void {
  if (Platform.OS === 'web') return;
  try {
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

export async function initializeAdMobSdk(): Promise<void> {
  if (Platform.OS === 'web' || isSdkInitialized) return;
  try {
    await mobileAds().initialize();
    isSdkInitialized = true;
    createAndLoadRewardedAd();
  } catch {
    // Graceful fallback if running in an environment without native module linked
  }
}

/**
 * Displays the Google AdMob Rewarded Ad for the "Watch Ad & Revive" feature.
 * Resolves with `{ rewarded: true }` once the user earns the reward (or if offline test fallback activates),
 * or `{ rewarded: false }` if the user dismisses the ad early before earning the reward.
 */
export function showRewardedReviveAd(): Promise<{ rewarded: boolean }> {
  if (Platform.OS === 'web') {
    return Promise.resolve({ rewarded: true });
  }

  return new Promise((resolve) => {
    let settled = false;
    let earnedReward = false;

    const finish = (rewarded: boolean) => {
      if (settled) return;
      settled = true;
      // Preload the next Rewarded Ad for subsequent revives
      createAndLoadRewardedAd();
      resolve({ rewarded });
    };

    try {
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
        // If test ad fails to load due to offline device state, grant revive after short delay
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
