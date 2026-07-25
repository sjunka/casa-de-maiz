jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDismissed, recordDismissal } from './dismissal';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('an alert never dismissed is not suppressed', async () => {
  expect(await isDismissed('alert-1', 24)).toBe(false);
});

test('a dismissed alert stays suppressed within its cooldown, surviving restarts', async () => {
  await recordDismissal('alert-1');
  expect(await isDismissed('alert-1', 24)).toBe(true);
});

test('a dismissed alert is no longer suppressed once its cooldown has passed', async () => {
  const past = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  await AsyncStorage.setItem('alert-dismissed:alert-1', past);
  expect(await isDismissed('alert-1', 24)).toBe(false);
});
