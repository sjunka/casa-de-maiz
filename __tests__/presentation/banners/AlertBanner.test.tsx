jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

import { Linking } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertBanner } from '@presentation/banners/AlertBanner';
import { resetScrollProgress, trackScrollProgress } from '@data/logic/scrollProgress';
import type { Alert } from '@core/contract/models/bootstrap/alert';

const scrollTo = (owner: string, percent: number) =>
  trackScrollProgress(owner)({
    nativeEvent: {
      contentOffset: { x: 0, y: percent * 10 },
      contentSize: { width: 400, height: 2000 },
      layoutMeasurement: { width: 400, height: 1000 },
    },
  } as NativeSyntheticEvent<NativeScrollEvent>);

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
  resetScrollProgress();
  jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
});

afterEach(() => {
  jest.useRealTimers();
});

test('appears after its trigger delay rather than flashing on load', async () => {
  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);

  expect(screen.queryByTestId('alert-banner')).toBeNull();

  await waitFor(() => expect(screen.getByText('Aviso de cierre')).toBeTruthy());
});

test('a dismissed alert can be dismissed and stays suppressed across restarts', async () => {
  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await waitFor(() => expect(screen.getByTestId('alert-banner')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('Descartar alerta'));
  await waitFor(() => expect(screen.queryByTestId('alert-banner')).toBeNull());
});

test('a dismissal survives a restart (fresh mount reads the persisted cooldown)', async () => {
  await AsyncStorage.setItem('alert-dismissed:closing-notice', new Date().toISOString());

  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await new Promise(resolve => setTimeout(() => resolve(undefined), 20));
  expect(screen.queryByTestId('alert-banner')).toBeNull();
});

test('waiting out the undo window commits the dismissal and records it', async () => {
  jest.useFakeTimers();

  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await act(async () => jest.advanceTimersByTime(10));
  expect(screen.getByTestId('alert-banner')).toBeTruthy();

  await fireEvent.press(screen.getByLabelText('Descartar alerta'));
  await act(async () => jest.advanceTimersByTime(4000));

  expect(screen.queryByTestId('alert-banner')).toBeNull();
  expect(await AsyncStorage.getItem('alert-dismissed:closing-notice')).toBeTruthy();
});

test('auto-dismisses 8 seconds after showing, so an evaluator never has to close it by hand', async () => {
  jest.useFakeTimers();

  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await act(async () => jest.advanceTimersByTime(10));
  expect(screen.getByTestId('alert-banner')).toBeTruthy();

  await act(async () => jest.advanceTimersByTime(8000));
  await act(async () => jest.advanceTimersByTime(4000));
  expect(screen.queryByTestId('alert-banner')).toBeNull();
});

test('an action navigates through the destination resolver', async () => {
  await render(<AlertBanner alerts={[alert()]} currentPageSlug="home" />);
  await waitFor(() => expect(screen.getByTestId('alert-banner')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('Learn more'));
  await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith('https://example.com'));
});

test('a scrollPercent alert stays hidden until the guest reaches its threshold', async () => {
  const scrollAlert = alert({ trigger: { type: 'scrollPercent', scrollPercent: 40, delayMs: 10 } });
  await render(<AlertBanner alerts={[scrollAlert]} currentPageSlug="home" />);

  await act(() => scrollTo('home', 20));
  await new Promise(resolve => setTimeout(() => resolve(undefined), 20));
  expect(screen.queryByTestId('alert-banner')).toBeNull();

  await act(() => scrollTo('home', 45));
  await waitFor(() => expect(screen.getByTestId('alert-banner')).toBeTruthy());
});

test('a scrollPercent alert ignores scrolling on a different page', async () => {
  const scrollAlert = alert({ trigger: { type: 'scrollPercent', scrollPercent: 40, delayMs: 10 } });
  await render(<AlertBanner alerts={[scrollAlert]} currentPageSlug="home" />);

  await act(() => scrollTo('menu', 90));
  await new Promise(resolve => setTimeout(() => resolve(undefined), 20));
  expect(screen.queryByTestId('alert-banner')).toBeNull();
});

test('an alert targeting other pages does not appear on this page', async () => {
  await render(<AlertBanner alerts={[alert({ pageSlugs: ['menu'] })]} currentPageSlug="home" />);
  await new Promise(resolve => setTimeout(() => resolve(undefined), 20));
  expect(screen.queryByTestId('alert-banner')).toBeNull();
});
