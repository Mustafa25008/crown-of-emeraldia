export interface RewardedAdResult {
  rewarded: boolean;
  error?: string;
}

export async function initializeAdMobSdk(): Promise<boolean> {
  // No-op on web platform
  return false;
}

export function showRewardedReviveAd(): Promise<RewardedAdResult> {
  return Promise.resolve({
    rewarded: false,
    error: 'Ad unavailable. Please check your connection or disable ad blocker to revive!',
  });
}

