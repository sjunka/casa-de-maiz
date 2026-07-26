import { Platform } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AndroidTabBar } from '@navigation/AndroidTabBar';
import { lightColors } from '@presentation/theme/tokens';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const buildProps = (): BottomTabBarProps => {
  const navigate = jest.fn();
  const emit = jest.fn().mockReturnValue({ defaultPrevented: false });

  return {
    state: {
      key: 'tab',
      index: 0,
      routeNames: ['home', 'menu'],
      routes: [
        { key: 'home-key', name: 'home' },
        { key: 'menu-key', name: 'menu' },
      ],
      type: 'tab',
      stale: false,
      history: [],
    } as unknown as BottomTabBarProps['state'],
    descriptors: {
      'home-key': { options: { tabBarLabel: 'Inicio' } },
      'menu-key': { options: { tabBarLabel: 'Menu' } },
    } as unknown as BottomTabBarProps['descriptors'],
    navigation: { emit, navigate } as unknown as BottomTabBarProps['navigation'],
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  };
};

test('the focused tab is tinted, ripple-enabled, and pressing an unfocused tab navigates to it', async () => {
  Platform.OS = 'android';
  const props = buildProps();

  await render(<AndroidTabBar {...props} colors={lightColors} />);

  const home = screen.getByLabelText('Inicio');
  expect(home.props.accessibilityState).toEqual({ selected: true });

  const menu = screen.getByLabelText('Menu');
  expect(menu.props.accessibilityState).toEqual({ selected: false });

  fireEvent.press(menu);
  expect(props.navigation.navigate).toHaveBeenCalledWith('menu', undefined);
});
