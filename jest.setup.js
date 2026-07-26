/* eslint-env jest */
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

// Reanimated's shipped mock still loads the real module (and with it the
// native worklets binding jest has no access to), so this is the smallest mock
// that covers what the app uses: animations land on their target value at once
// and completion callbacks fire synchronously.
jest.mock('react-native-reanimated', () => {
  const { Text, View } = require('react-native');
  const identity = (value) => value;

  return {
    __esModule: true,
    default: { View, Text },
    Easing: { in: identity, out: identity, cubic: identity },
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: (factory) => factory(),
    withTiming: (toValue, _config, callback) => {
      callback?.(true);
      return toValue;
    },
    runOnJS: identity,
  };
});

jest.mock('react-native-config', () => ({
  API_BASE_URL: 'https://payload-cms-poc-seven.vercel.app',
}));

jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: (component) => component,
  setTag: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));
