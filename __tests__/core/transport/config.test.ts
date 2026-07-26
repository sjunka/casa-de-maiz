import { API_BASE_URL } from '@core/transport/config';

test('reads the API base URL from react-native-config', () => {
  expect(API_BASE_URL).toBe('https://payload-cms-poc-seven.vercel.app');
});
