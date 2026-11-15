import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { getBannerAdUnitId } from './admobConfig';
import { getSafeAdMobModule } from './rewardedAdManager';

export interface AdBannerSlotProps {
  visible: boolean;
  sdkReady?: boolean;
  refreshKey?: string | number;
}

interface AdErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface AdErrorBoundaryState {
  hasError: boolean;
}

class AdErrorBoundary extends Component<AdErrorBoundaryProps, AdErrorBoundaryState> {
  constructor(props: AdErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AdErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Gracefully hide banner slot without crashing the app
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Renders the Google AdMob Banner Ad directly over the bottom pixel-art ground of the full-screen game environment.
 * - Positioned absolutely at the bottom (`backgroundColor: 'transparent'`, `borderWidth: 0`) so the game environment
 *   screen extends 100% to the very bottom of the device.
 * - Refreshes automatically on every screen change via `refreshKey`.
 * - If the ad does not load, is blocked by an ad blocker, or is offline, renders `null` (no text, no border,
 *   100% transparent) so the complete game environment screen remains cleanly visible.
 */
export function AdBannerSlot({ visible, sdkReady = false, refreshKey = 'initial' }: AdBannerSlotProps) {
  const [adLoadFailed, setAdLoadFailed] = useState<boolean>(false);

  useEffect(() => {
    setAdLoadFailed(false);
  }, [refreshKey]);

  if (!visible || Platform.OS === 'web' || !sdkReady) {
    return null;
  }

  const adMob = getSafeAdMobModule();
  if (!adMob || adLoadFailed) {
    return null;
  }

  const { BannerAd, BannerAdSize } = adMob;
  const unitId = getBannerAdUnitId();
  const bannerSize = BannerAdSize.ANCHORED_ADAPTIVE_BANNER || BannerAdSize.BANNER;

  return (
    <View
      style={styles.slotContainer}
      pointerEvents="box-none"
      accessibilityLabel="Mobile Menu Ad Banner Slot"
    >
      <AdErrorBoundary key={`boundary-${refreshKey}`} fallback={null}>
        <BannerAd
          key={`banner-${refreshKey}`}
          unitId={unitId}
          size={bannerSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            setAdLoadFailed(false);
          }}
          onAdFailedToLoad={() => {
            setAdLoadFailed(true);
          }}
        />
      </AdErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  slotContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    minHeight: 52,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 20,
  },
});
