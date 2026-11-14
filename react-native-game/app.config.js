const appJson = require('./app.json');

const ANDROID_TEST_APP_ID = 'ca-app-pub-3940256099942544~3375010800';
const IOS_TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

module.exports = ({ config }) => {
  const baseExpoConfig = appJson.expo || config || {};
  const androidAppId =
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || ANDROID_TEST_APP_ID;
  const iosAppId =
    process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || IOS_TEST_APP_ID;

  const existingPlugins = Array.isArray(baseExpoConfig.plugins)
    ? baseExpoConfig.plugins.filter(
        (plugin) =>
          !(Array.isArray(plugin) && plugin[0] === 'react-native-google-mobile-ads') &&
          plugin !== 'react-native-google-mobile-ads'
      )
    : [];

  return {
    ...baseExpoConfig,
    plugins: [
      ...existingPlugins,
      [
        'react-native-google-mobile-ads',
        {
          androidAppId,
          iosAppId,
          delayAppMeasurementInit: true,
        },
      ],
    ],
    extra: {
      ...(baseExpoConfig.extra || {}),
      admob: {
        androidAppId,
        iosAppId,
        androidBannerId:
          process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ||
          'ca-app-pub-3940256099942544/6300978111',
        androidRewardedId:
          process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID ||
          'ca-app-pub-3940256099942544/5224354917',
        iosBannerId:
          process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ||
          'ca-app-pub-3940256099942544/2934735716',
        iosRewardedId:
          process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID ||
          'ca-app-pub-3940256099942544/1712485313',
      },
    },
  };
};
