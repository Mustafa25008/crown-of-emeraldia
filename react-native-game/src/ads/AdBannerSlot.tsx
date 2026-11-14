import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { getBannerAdUnitId } from './admobConfig';
import { getSafeAdMobModule } from './rewardedAdManager';

export interface AdBannerSlotProps {
  visible: boolean;
  sdkReady?: boolean;
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
    // Gracefully fall back to test slot UI without crashing the app
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Renders the Google AdMob Banner Ad inside the designated bottom mobile menu slot.
 * Strictly hidden during active gameplay (visible === false), guarded by AdErrorBoundary,
 * and only mounts the native BannerAd once the AdMob SDK is initialized.
 */
export function AdBannerSlot({ visible, sdkReady = false }: AdBannerSlotProps) {
  const [adLoadFailed, setAdLoadFailed] = useState<boolean>(false);

  if (!visible || Platform.OS === 'web') {
    return null;
  }

  const fallbackElement = (
    <View style={styles.fallbackSlot}>
      <Text style={styles.fallbackText}>AD BANNER SPACE (TEST MODE)</Text>
    </View>
  );

  const adMob = sdkReady ? getSafeAdMobModule() : null;
  if (!adMob || adLoadFailed) {
    return (
      <View style={styles.slotContainer} accessibilityLabel="Mobile Menu Ad Banner Slot">
        {fallbackElement}
      </View>
    );
  }

  const { BannerAd, BannerAdSize } = adMob;
  const unitId = getBannerAdUnitId();
  const bannerSize = BannerAdSize.ANCHORED_ADAPTIVE_BANNER || BannerAdSize.BANNER;

  return (
    <View style={styles.slotContainer} accessibilityLabel="Mobile Menu Ad Banner Slot">
      <AdErrorBoundary fallback={fallbackElement}>
        <BannerAd
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
    width: '100%',
    minHeight: 52,
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackSlot: {
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
