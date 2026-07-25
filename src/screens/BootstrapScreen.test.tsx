jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BootstrapScreen } from './BootstrapScreen';

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const renderScreen = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <BootstrapScreen currentRouteName="home" />
      </NavigationContainer>
    </QueryClientProvider>,
  );
};

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

test('shows the operational notice banner and gates a required app update', async () => {
  globalThis.fetch = jest.fn().mockResolvedValue(
    jsonResponse({
      contractVersion: '1.1',
      data: {
        navigation: { items: [] },
        operationalControls: {
          mode: 'notice',
          bannerMessage: 'Hoy cerramos cocina a las 22:30.',
          appUpdate: { policy: 'required', minimumVersion: '1.5.0', message: 'Actualiza Casa Maiz.' },
        },
      },
      nextChangeAt: null,
      preview: false,
      resolvedContext: {},
    }),
  ) as unknown as typeof fetch;

  renderScreen();

  await waitFor(() => expect(screen.getByTestId('app-update-required')).toBeTruthy());
  expect(screen.getByText('Actualiza Casa Maiz.')).toBeTruthy();
  expect(screen.queryByText('Hoy cerramos cocina a las 22:30.')).toBeNull();
});

test('renders the operational banner and navigation when there is no blocking update', async () => {
  globalThis.fetch = jest.fn().mockResolvedValue(
    jsonResponse({
      contractVersion: '1.1',
      data: {
        navigation: {
          items: [{ label: 'Inicio', highlighted: false, destination: { key: 'home', label: 'Home', path: '/', supportedPlatforms: ['ios', 'android'] } }],
        },
        operationalControls: { mode: 'notice', bannerMessage: 'Hoy cerramos cocina a las 22:30.' },
      },
      nextChangeAt: null,
      preview: false,
      resolvedContext: {},
    }),
  ) as unknown as typeof fetch;

  renderScreen();

  await waitFor(() => expect(screen.getByTestId('operational-notice-banner')).toBeTruthy());
  expect(screen.getByText('Hoy cerramos cocina a las 22:30.')).toBeTruthy();
  expect(screen.getByText('Inicio')).toBeTruthy();
});
