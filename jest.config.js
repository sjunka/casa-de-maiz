module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  forceExit: true,
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|react-native-safe-area-context|@react-navigation|react-native-screens|@sentry)/)',
  ],
};
