import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { Destination } from '@core/contract/models/bootstrap';
import { resolveDestination } from './resolveDestination';
import { isDestinationEnabled } from '@data/logic/featureFlags';
import { AppTabBar } from './AppTabBar';
import { useTheme } from '@presentation/theme/useTheme';
import type { RootTabParamList } from './types';
import { HomeScreen } from '@presentation/screens/HomeScreen';
import { MenuScreen } from '@presentation/screens/MenuScreen';
import { PrivacyScreen } from '@presentation/screens/PrivacyScreen';
import { ReservationsScreen } from '@presentation/screens/ReservationsScreen';
import { FormFixtureScreen } from '@presentation/screens/FormFixtureScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

type Props = { destinations: Destination[]; flags?: Record<string, boolean> };

export const TabNavigator = ({ destinations, flags = {} }: Props) => {
  const { colors, scheme } = useTheme();
  const screens: React.JSX.Element[] = [];

  for (const destination of destinations) {
    if (!destination.platforms.includes(Platform.OS as 'ios' | 'android')) {
      continue;
    }

    if (!isDestinationEnabled(destination.key, flags)) {
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

  if (__DEV__) {
    screens.push(
      <Tab.Screen
        key="formFixture"
        name="formFixture"
        component={FormFixtureScreen}
        options={{ tabBarLabel: 'Form (dev)', tabBarAccessibilityLabel: 'Form (dev)' }}
      />,
    );
  }

  return (
    <Tab.Navigator
      // react-navigation calls `tabBar` as a plain function, not JSX, so it
      // never gets its own Fiber — AppTabBar can't call hooks itself
      // (see its file comment). Theme and chrome are resolved here instead.
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={props => <AppTabBar {...props} colors={colors} scheme={scheme} />}
    >
      {screens}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  highlighted: { fontWeight: '700' },
});
