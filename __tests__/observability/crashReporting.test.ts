jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import * as Sentry from '@sentry/react-native';
import { initCrashReporting, reportTransportError, reportUnknownBlock } from '@observability/crashReporting';

beforeEach(() => {
  jest.clearAllMocks();
});

test('does not initialise Sentry when no DSN is configured', () => {
  initCrashReporting();

  expect(Sentry.init).not.toHaveBeenCalled();
});

test('reports transport errors with endpoint and status but not the error message body', () => {
  const error = new Error('some technical detail');

  reportTransportError(error, { endpoint: '/bootstrap', status: 500, kind: 'http' });

  expect(Sentry.captureException).toHaveBeenCalledWith(error, {
    tags: { endpoint: '/bootstrap', status: 500, kind: 'http' },
  });
});

test('reports an unknown block type as a breadcrumb', () => {
  reportUnknownBlock('newsletterSignup');

  expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringContaining('newsletterSignup') }),
  );
});
