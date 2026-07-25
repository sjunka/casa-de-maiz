jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertBanner } from './AlertBanner';
import type { Alert } from '../models/alert';

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'closing-notice',
  message: 'Aviso de cierre',
  placement: 'topBar',
  trigger: { type: 'load', delayMs: 10 },
  dismissible: true,
  frequency: { type: 'always', cooldownHours: 24 },
  pageSlugs: [],
  priority: 100,
  actions: [{ href: 'https://example.com', label: 'Learn more' }],
  ...overrides,
});

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
});

test('appears after its trigger delay rather than flashing on load', async () => {
  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);

  expect(screen.queryByTestId('alert-banner')).toBeNull();

  await waitFor(() => expect(screen.getByText('Aviso de cierre')).toBeTruthy());
});

test('a dismissed alert can be dismissed and stays suppressed across restarts', async () => {
  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await waitFor(() => expect(screen.getByTestId('alert-banner')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('Dismiss alert'));
  await waitFor(() => expect(screen.queryByTestId('alert-banner')).toBeNull());
});

test('a dismissal survives a restart (fresh mount reads the persisted cooldown)', async () => {
  await AsyncStorage.setItem('alert-dismissed:closing-notice', new Date().toISOString());

  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await new Promise(resolve => setTimeout(() => resolve(undefined), 20));
  expect(screen.queryByTestId('alert-banner')).toBeNull();
});

test('an action navigates through the destination resolver', async () => {
  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await waitFor(() => expect(screen.getByTestId('alert-banner')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('Learn more'));
  await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith('https://example.com'));
});

test('an alert targeting other pages does not appear on this page', async () => {
  await render(<AlertBanner alerts={[alert({ pageSlugs: ['menu'] })]} currentPageSlug="home" />);
  await new Promise(resolve => setTimeout(() => resolve(undefined), 20));
  expect(screen.queryByTestId('alert-banner')).toBeNull();
});
