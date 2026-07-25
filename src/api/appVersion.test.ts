jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

import { getAppVersion } from './appVersion';

test('reads the installed app version in semantic-version format', () => {
  expect(getAppVersion()).toBe('1.0.0');
});
