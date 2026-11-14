import React from 'react';

export interface AdBannerSlotProps {
  visible: boolean;
}

/**
 * Web fallback for AdBannerSlot — clean no-op on Web.
 */
export function AdBannerSlot(_props: AdBannerSlotProps) {
  return null;
}
