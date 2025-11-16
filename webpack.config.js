const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['react-native-worklets']
      }
    },
    argv
  );

  // Suppress PlatformColor warning
  config.ignoreWarnings = [
    /export 'PlatformColor'/,
    /Critical dependency: require function is used in a way/
  ];

  // Add fallback for PlatformColor
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native/Libraries/StyleSheet/PlatformColorValueTypesIOS': 'react-native-web/dist/modules/PlatformColorValueTypes',
    'react-native/Libraries/StyleSheet/PlatformColorValueTypes': 'react-native-web/dist/modules/PlatformColorValueTypes'
  };

  return config;
};
