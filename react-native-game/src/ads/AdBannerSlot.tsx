import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId } from './admobConfig';

export interface AdBannerSlotProps {
  visible: boolean;
}

/**
 * Renders the Google AdMob Banner Ad inside the designated bottom mobile menu slot.
 * Strictly hidden during active gameplay (visible === false), and no-op on Web.
 */
export function AdBannerSlot({ visible }: AdBannerSlotProps) {
  const [adLoadFailed, setAdLoadFailed] = useState<boolean>(false);

  if (!visible || Platform.OS === 'web') {
    return null;
  }

  const unitId = getBannerAdUnitId();

  return (
    <View style={styles.slotContainer} accessibilityLabel="Mobile Menu Ad Banner Slot">
      {!adLoadFailed ? (
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
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
      ) : (
        <View style={styles.fallbackSlot}>
          <Text style={styles.fallbackText}>AD BANNER SPACE (TEST MODE)</Text>
        </View>
      )}
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
