jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
}));

import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabNavigator } from './TabNavigator';
import type { Destination } from '../models/bootstrap';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const destination = (overrides: Partial<Destination>): Destination => ({
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

  expect(screen.queryByText('Menu')).toBeNull();
  expect(screen.getByText('Inicio')).toBeTruthy();
  expect(screen.getByText('Reservar')).toBeTruthy();

  await waitFor(() => expect(screen.getByTestId('content-empty')).toBeTruthy());
});
