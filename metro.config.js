const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      '@core/transport': path.resolve(__dirname, 'src/core/transport'),
      '@core/contract': path.resolve(__dirname, 'src/core/contract'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
