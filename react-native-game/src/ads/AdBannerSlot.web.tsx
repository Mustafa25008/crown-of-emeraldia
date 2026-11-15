import React from 'react';

export interface AdBannerSlotProps {
  visible: boolean;
  sdkReady?: boolean;
  refreshKey?: string | number;
}

/**
 * Web fallback for AdBannerSlot — clean no-op on Web (Web uses WebAdMobTestBanner inside src/App.tsx).
 */
export function AdBannerSlot(_props: AdBannerSlotProps) {
  return null;
}
