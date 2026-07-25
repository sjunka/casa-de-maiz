import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { Destination } from '../models/bootstrap';
import { resolveDestination } from './resolveDestination';
import type { RootTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { ReservationsScreen } from '../screens/ReservationsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

type Props = { destinations: Destination[] };

export const TabNavigator = ({ destinations }: Props) => {
  const screens: React.JSX.Element[] = [];

  for (const destination of destinations) {
    if (!destination.platforms.includes(Platform.OS as 'ios' | 'android')) {
      continue;
    }

    const resolved = resolveDestination(destination.path);
    if (resolved.kind !== 'internal') {
      continue;
    }

    const options = {
      tabBarLabel: destination.label,
      tabBarAccessibilityLabel: destination.label,
      tabBarLabelStyle: destination.highlighted ? styles.highlighted : undefined,
    };

    switch (resolved.screen) {
      case 'home':
        screens.push(<Tab.Screen key="home" name="home" component={HomeScreen} options={options} />);
        break;
      case 'menu':
        screens.push(<Tab.Screen key="menu" name="menu" component={MenuScreen} options={options} />);
        break;
      case 'privacy':
        screens.push(
          <Tab.Screen
            key="privacy"
            name="privacy"
            component={PrivacyScreen}
            initialParams={{ legalKey: resolved.legalKey }}
            options={options}
          />,
        );
        break;
      case 'reservations':
        screens.push(
          <Tab.Screen key="reservations" name="reservations" component={ReservationsScreen} options={options} />,
        );
        break;
    }
  }

  return <Tab.Navigator>{screens}</Tab.Navigator>;
};

const styles = StyleSheet.create({
  highlighted: { fontWeight: '700' },
});
