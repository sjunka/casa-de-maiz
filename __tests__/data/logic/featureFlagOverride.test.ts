jest.mock('react-native-config', () => ({
  API_BASE_URL: 'https://payload-cms-poc-seven.vercel.app',
  FEATURE_FLAG_OVERRIDES: 'enable_new_home=false',
}));

import { isDestinationEnabled } from '@data/logic/featureFlags';

test('a local override demonstrates the gate in the opposite direction from the live response', () => {
  // Live response says the flag is on; the local override forces it off.
  expect(isDestinationEnabled('reservations', { enable_new_home: true })).toBe(false);
});
