jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabNavigator } from '@navigation/TabNavigator';
import type { Destination } from '@core/contract/models/bootstrap';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const destination = (overrides: Partial<Destination>): Destination => ({
  key: 'home',
  path: '/',
  label: 'Home',
  platforms: ['ios', 'android'],
  highlighted: false,
  ...overrides,
});

test('builds tabs only for destinations that support the running platform, in the returned order and labels', async () => {
  const destinations = [
    destination({ path: '/menu', label: 'Menu', platforms: ['android'] }),
    destination({ path: '/', label: 'Inicio', platforms: ['ios', 'android'] }),
    destination({ path: '/reservas', label: 'Reservar', platforms: ['ios'] }),
  ];

  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      contractVersion: '1.1',
      data: { layout: [] },
      nextChangeAt: null,
      preview: false,
      resolvedContext: {},
    }),
  }) as unknown as typeof fetch;

  await render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <TabNavigator destinations={destinations} />
      </NavigationContainer>
    </QueryClientProvider>,
  );

  expect(screen.queryByLabelText('Menu')).toBeNull();
  expect(screen.getByLabelText('Inicio')).toBeTruthy();
  expect(screen.getByLabelText('Reservar')).toBeTruthy();

  await waitFor(() => expect(screen.getByTestId('content-empty')).toBeTruthy());
});

test('a feature-flag change alters which destinations appear in navigation', async () => {
  const destinations = [
    destination({ key: 'home', path: '/', label: 'Inicio' }),
    destination({ key: 'reservations', path: '/reservas', label: 'Reservar' }),
  ];

  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      contractVersion: '1.1',
      data: { layout: [] },
      nextChangeAt: null,
      preview: false,
      resolvedContext: {},
    }),
  }) as unknown as typeof fetch;

  const { unmount } = await render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <TabNavigator destinations={destinations} flags={{ enable_new_home: false }} />
      </NavigationContainer>
    </QueryClientProvider>,
  );

  expect(screen.getByLabelText('Inicio')).toBeTruthy();
  expect(screen.queryByLabelText('Reservar')).toBeNull();
  unmount();

  await render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <TabNavigator destinations={destinations} flags={{ enable_new_home: true }} />
      </NavigationContainer>
    </QueryClientProvider>,
  );

  expect(screen.getByLabelText('Inicio')).toBeTruthy();
  expect(screen.getByLabelText('Reservar')).toBeTruthy();
});

test('a mapped flag missing from the response is treated as off', async () => {
  const destinations = [destination({ key: 'reservations', path: '/reservas', label: 'Reservar' })];

  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      contractVersion: '1.1',
      data: { layout: [] },
      nextChangeAt: null,
      preview: false,
      resolvedContext: {},
    }),
  }) as unknown as typeof fetch;

  await render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <TabNavigator destinations={destinations} flags={{}} />
      </NavigationContainer>
    </QueryClientProvider>,
  );

  expect(screen.queryByLabelText('Reservar')).toBeNull();
});
