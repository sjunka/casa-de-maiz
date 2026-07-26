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
    // Metro parses `@scope/pkg/sub` as package `@scope/pkg`, so each src/core
    // subdirectory needs its own extraNodeModules entry (unlike the single
    // wildcard tsconfig.json and jest.config.js use for the same alias).
    extraNodeModules: {
      '@core/transport': path.resolve(__dirname, 'src/core/transport'),
      '@core/contract': path.resolve(__dirname, 'src/core/contract'),
      '@data/repository': path.resolve(__dirname, 'src/data/repository'),
      '@data/state': path.resolve(__dirname, 'src/data/state'),
      '@presentation/blocks': path.resolve(__dirname, 'src/presentation/blocks'),
      '@presentation/banners': path.resolve(__dirname, 'src/presentation/banners'),
      '@presentation/ui': path.resolve(__dirname, 'src/presentation/ui'),
      '@presentation/theme': path.resolve(__dirname, 'src/presentation/theme'),
      '@presentation/screens': path.resolve(__dirname, 'src/presentation/screens'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
