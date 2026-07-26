import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { RestaurantCtaBlock } from '@presentation/blocks/RestaurantCtaBlock';
import type { RestaurantCtaBlock as RestaurantCtaBlockData } from '@core/contract/models/block';

const Tab = createBottomTabNavigator();

const block: RestaurantCtaBlockData = {
  blockType: 'restaurantCTA',
  contractVersion: '1.1',
  channels: ['ios', 'android'],
  headline: 'Reserva tu mesa',
  label: 'Reservar ahora',
  href: '/reservas',
};

test('navigates through the destination resolver when pressed', async () => {
  await render(
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="home">{() => <RestaurantCtaBlock block={block} />}</Tab.Screen>
        <Tab.Screen name="reservations">{() => <Text>Reservations screen</Text>}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>,
  );

  await fireEvent.press(screen.getByLabelText('Reservar ahora'));

  expect(screen.getByText('Reservations screen')).toBeTruthy();
});
