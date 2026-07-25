import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import type { Destination } from '../models/bootstrap';

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

  await render(
    <NavigationContainer>
      <TabNavigator destinations={destinations} />
    </NavigationContainer>,
  );

  expect(screen.queryByText('Menu')).toBeNull();
  expect(screen.getByText('Inicio')).toBeTruthy();
  expect(screen.getByText('Reservar')).toBeTruthy();
});
