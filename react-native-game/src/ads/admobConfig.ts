import { Platform } from 'react-native';

export const ADMOB_TEST_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3375010800',
    bannerId: 'ca-app-pub-3940256099942544/6300978111',
    rewardedId: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511',
    bannerId: 'ca-app-pub-3940256099942544/2934735716',
    rewardedId: 'ca-app-pub-3940256099942544/1712485313',
  },
} as const;

export function getBannerAdUnitId(): string {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || ADMOB_TEST_IDS.ios.bannerId;
  }
  return process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || ADMOB_TEST_IDS.android.bannerId;
}

export function getRewardedAdUnitId(): string {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID || ADMOB_TEST_IDS.ios.rewardedId;
  }
  return process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID || ADMOB_TEST_IDS.android.rewardedId;
}
