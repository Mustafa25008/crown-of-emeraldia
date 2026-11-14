const appJson = require('./app.json');

const ANDROID_TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const IOS_TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

/**
 * Custom Expo config plugin that ensures Android release/preview builds
 * do not strip React Native New Architecture / AdMob classes via R8 minification.
 */
function withSafeReleaseGradleProperties(config) {
  try {
    const { withGradleProperties } = require('@expo/config-plugins');
    return withGradleProperties(config, (modConfig) => {
      const props = Array.isArray(modConfig.modResults) ? modConfig.modResults : [];
      const setProp = (key, value) => {
        const existing = props.find((item) => item.type === 'property' && item.key === key);
        if (existing) {
          existing.value = value;
        } else {
          props.push({ type: 'property', key, value });
        }
      };
      setProp('android.enableMinifyInReleaseBuilds', 'false');
      setProp('android.enableShrinkResourcesInReleaseBuilds', 'false');
      modConfig.modResults = props;
      return modConfig;
    });
  } catch {
    return config;
  }
}

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

  const nextConfig = {
    ...baseExpoConfig,
    orientation: 'portrait',
    plugins: [
      ...existingPlugins,
      [
        'react-native-google-mobile-ads',
        {
          androidAppId,
          iosAppId,
          delayAppMeasurementInit: false,
          optimizeInitialization: true,
          optimizeAdLoading: true,
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
          'ca-app-pub-3940256099942544/9214589741',
        androidRewardedId:
          process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID ||
          'ca-app-pub-3940256099942544/5224354917',
        iosBannerId:
          process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ||
          'ca-app-pub-3940256099942544/2435281174',
        iosRewardedId:
          process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID ||
          'ca-app-pub-3940256099942544/1712485313',
      },
    },
  };

  return withSafeReleaseGradleProperties(nextConfig);
};
