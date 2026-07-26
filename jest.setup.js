/* eslint-env jest */
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

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
