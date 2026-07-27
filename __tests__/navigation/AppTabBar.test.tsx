import { Platform } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AppTabBar } from '@navigation/components/AppTabBar';
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

test.each(['ios', 'android'] as const)(
  '%s: the focused tab is marked, every tab keeps an accessible name despite the icon-only rail, and pressing an unfocused tab navigates to it',
  async platform => {
    Platform.OS = platform;
    const props = buildProps();

    await render(<AppTabBar {...props} colors={lightColors} scheme="light" />);

    const home = screen.getByLabelText('Inicio');
    expect(home.props.accessibilityState).toEqual({ selected: true });

    const menu = screen.getByLabelText('Menu');
    expect(menu.props.accessibilityState).toEqual({ selected: false });

    fireEvent.press(menu);
    expect(props.navigation.navigate).toHaveBeenCalledWith('menu', undefined);

    if (platform === 'android') {
      expect(home.props.nativeBackgroundAndroid?.color).toEqual(expect.any(Number));
    } else {
      expect(home.props.nativeBackgroundAndroid).toBeUndefined();
    }
  },
);

test('a destination flagged as highlighted shows the dot, unflagged ones do not', async () => {
  const props = buildProps();
  (props.descriptors['home-key'].options as { tabBarHighlighted?: boolean }).tabBarHighlighted = true;

  await render(<AppTabBar {...props} colors={lightColors} scheme="light" />);

  expect(screen.getByTestId('home-highlighted-dot')).toBeTruthy();
  expect(screen.queryByTestId('menu-highlighted-dot')).toBeNull();
});
