jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { buildDeliveryContext } from './deliveryContext';

test('builds all four delivery-context parameters from the pinned platform and installed version', () => {
  expect(buildDeliveryContext()).toEqual({
    platform: 'ios',
    market: 'MX',
    audience: 'guest',
    appVersion: '1.0.0',
  });
});
