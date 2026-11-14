/**
 * Web no-op fallback for Rewarded Ad Manager.
 */
export async function initializeAdMobSdk(): Promise<void> {
  // No-op on web
}

export function showRewardedReviveAd(): Promise<{ rewarded: boolean }> {
  return Promise.resolve({ rewarded: true });
}
