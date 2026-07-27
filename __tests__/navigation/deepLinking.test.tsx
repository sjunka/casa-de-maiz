import { Linking, Text } from 'react-native';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { navigationRef, flushPendingNavigation } from '@navigation/destinations/navigationRef';
import { handleDeepLink, initDeepLinking } from '@navigation/destinations/deepLinking';
import type { RootTabParamList } from '@navigation/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const stubScreen = (name: string) => () => <Text>{`screen-${name}`}</Text>;

// Mirrors the real app: the tab navigator only mounts once bootstrap has
// resolved, so `ready=false` reproduces the pre-navigator window a cold-start
// link can race.
const TestApp = ({ ready }: { ready: boolean }) => (
  <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation}>
    {ready ? (
      <Tab.Navigator>
        <Tab.Screen name="home" component={stubScreen('home')} />
        <Tab.Screen name="menu" component={stubScreen('menu')} />
        <Tab.Screen name="privacy" component={stubScreen('privacy')} initialParams={{ legalKey: '' }} />
        <Tab.Screen name="reservations" component={stubScreen('reservations')} />
      </Tab.Navigator>
    ) : null}
  </NavigationContainer>
);

test('a link arriving before the tab navigator mounts is held and replayed once ready', async () => {
  const view = await render(<TestApp ready={false} />);

  await act(() => handleDeepLink('casamaiz://menu'));
  await act(() => view.rerender(<TestApp ready />));

  await waitFor(() => expect(screen.getByText('screen-menu')).toBeTruthy());
  view.unmount();
});

test('a link arriving while the app is already ready navigates immediately', async () => {
  const view = await render(<TestApp ready />);
  await waitFor(() => expect(screen.getByText('screen-home')).toBeTruthy());

  await act(() => handleDeepLink('casamaiz://legal/privacy_policy'));

  await waitFor(() => expect(screen.getByText('screen-privacy')).toBeTruthy());
  view.unmount();
});

test('the remaining published destinations open their screen', async () => {
  const view = await render(<TestApp ready />);
  await waitFor(() => expect(screen.getByText('screen-home')).toBeTruthy());

  await act(() => handleDeepLink('casamaiz://reservas'));
  await waitFor(() => expect(screen.getByText('screen-reservations')).toBeTruthy());

  await act(() => handleDeepLink('casamaiz://'));
  await waitFor(() => expect(screen.getByText('screen-home')).toBeTruthy());

  view.unmount();
});

test('an unsupported path fails safe onto home instead of a dead screen', async () => {
  const view = await render(<TestApp ready />);
  await act(() => handleDeepLink('casamaiz://menu'));
  await waitFor(() => expect(screen.getByText('screen-menu')).toBeTruthy());

  await act(() => handleDeepLink('casamaiz://catering'));

  await waitFor(() => expect(screen.getByText('screen-home')).toBeTruthy());
  view.unmount();
});

test('a foreign scheme is rejected and never navigates', async () => {
  const view = await render(<TestApp ready />);
  await waitFor(() => expect(screen.getByText('screen-home')).toBeTruthy());

  await act(() => handleDeepLink('other://menu'));

  expect(screen.getByText('screen-home')).toBeTruthy();
  expect(screen.queryByText('screen-menu')).toBeNull();
  view.unmount();
});

test('initDeepLinking consumes the initial URL on cold start and subscribes for warm start', async () => {
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue('casamaiz://menu');
  const addEventListenerSpy = jest.spyOn(Linking, 'addEventListener');

  const view = await render(<TestApp ready />);
  const unsubscribe = initDeepLinking();

  await waitFor(() => expect(screen.getByText('screen-menu')).toBeTruthy());
  expect(addEventListenerSpy).toHaveBeenCalledWith('url', expect.any(Function));

  unsubscribe();
  view.unmount();
});
