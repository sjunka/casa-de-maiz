import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  home: undefined;
  menu: undefined;
  privacy: { legalKey: string };
  reservations: undefined;
  formFixture: undefined;
};

// `BottomTabNavigationOptions` is a type alias upstream, not an interface, so
// it can't be augmented via declaration merging — this rides alongside it
// instead. AppTabBar is a fully custom tabBar render, so nothing but our own
// code needs to know about this field.
export type TabOptions = BottomTabNavigationOptions & { tabBarHighlighted?: boolean };
