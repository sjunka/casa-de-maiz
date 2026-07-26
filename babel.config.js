module.exports = {
  presets: [
    ['module:@react-native/babel-preset', { enableBabelRuntime: '^7.25.0' }],
  ],
  // Reanimated worklets plugin has to stay last in the list.
  plugins: ['react-native-worklets/plugin'],
};
