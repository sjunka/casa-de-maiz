jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeScreen } from './HomeScreen';

const envelope = (data: Record<string, unknown>, overrides: Record<string, unknown> = {}) => ({
  contractVersion: '1.1',
  data,
  nextChangeAt: null,
  preview: false,
  resolvedContext: {},
  ...overrides,
});

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const homeEnvelope = envelope({
  layout: [{ blockType: 'textBlock', contractVersion: '1.1', channels: ['ios', 'android'], body: 'Hola' }],
});
const bootstrapEnvelope = envelope({ navigation: { items: [] } });

// Routes each fetch by URL so a screen's own request and its bootstrap
// request can be scripted independently, regardless of call order.
const fetchRoutedBy = (responses: {
  home?: () => ReturnType<typeof jsonResponse> | Promise<ReturnType<typeof jsonResponse>>;
  bootstrap?: () => ReturnType<typeof jsonResponse> | Promise<ReturnType<typeof jsonResponse>>;
}) =>
  jest.fn((url: string) => {
    if (url.includes('/bootstrap')) {
      return Promise.resolve((responses.bootstrap ?? (() => jsonResponse(bootstrapEnvelope)))());
    }
    return Promise.resolve((responses.home ?? (() => jsonResponse(homeEnvelope)))());
  }) as unknown as typeof fetch;

const renderScreen = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    </QueryClientProvider>,
  );
};

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await AsyncStorage.clear();
});

test('a successful load followed by a failing request serves saved content marked as such', async () => {
  globalThis.fetch = fetchRoutedBy({});
  renderScreen();
  await waitFor(() => expect(screen.getByText('Hola')).toBeTruthy());

  globalThis.fetch = fetchRoutedBy({ home: () => Promise.reject(new Error('offline')) as never });
  renderScreen();
  await waitFor(() => expect(screen.getByTestId('content-saved-banner')).toBeTruthy());
  expect(screen.getByText('Hola')).toBeTruthy();
});

test('an empty layout shows the empty-content state', async () => {
  globalThis.fetch = fetchRoutedBy({ home: () => jsonResponse(envelope({ layout: [] })) });

  renderScreen();

  await waitFor(() => expect(screen.getByTestId('content-empty')).toBeTruthy());
});

test('a 404 response shows the page-not-found state', async () => {
  globalThis.fetch = fetchRoutedBy({ home: () => jsonResponse({}, 404) });

  renderScreen();

  await waitFor(() => expect(screen.getByTestId('content-not-found')).toBeTruthy());
});

test('first launch offline with no saved content shows the retry state', async () => {
  globalThis.fetch = fetchRoutedBy({ home: () => Promise.reject(new Error('offline')) as never });

  renderScreen();

  await waitFor(() => expect(screen.getByTestId('content-error')).toBeTruthy());
  expect(screen.getByText('Try again')).toBeTruthy();
});
