module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    // The icon package `require`s its own .ttf so the native side can register
    // the font; jest has no loader for binary assets.
    '\\.ttf$': '<rootDir>/jest.fontStub.js',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@observability/(.*)$': '<rootDir>/src/observability/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|react-native-safe-area-context|@react-navigation|react-native-screens|react-native-reanimated|react-native-worklets|@sentry|@shopify/flash-list)/)',
  ],
};
