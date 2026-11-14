export async function initializeAdMobSdk(): Promise<boolean> {
  // No-op on web platform
  return false;
}

export function showRewardedReviveAd(): Promise<{ rewarded: boolean }> {
  return Promise.resolve({ rewarded: true });
}
