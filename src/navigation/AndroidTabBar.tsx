import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppPressable } from '@presentation/ui/AppPressable';
import { getElevatedSurfaceStyle } from '@presentation/theme/tokens';
import type { Theme } from '@presentation/theme/useTheme';

type Props = BottomTabBarProps & { colors: Theme['colors'] };

// Android has no built-in Material 3 tab indicator (@react-navigation/bottom-tabs
// has none), so the selected tab gets a custom tonal pill behind its label —
// the counterpart to the iOS glass tab bar background (ADR 0012).
//
// react-navigation invokes `tabBar` as a plain function call, not as JSX
// (see BottomTabView's `tabBar({...})`), so it never gets its own Fiber.
// Calling a hook here — even useTheme() — throws "Invalid hook call" on
// Android's renderer. `colors` is resolved by TabNavigator (a real
// component) and passed in instead.
export const AndroidTabBar = ({ state, descriptors, navigation, insets, colors }: Props) => {
  return (
    <View style={[styles.bar, getElevatedSurfaceStyle(colors), { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AppPressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? (typeof label === 'string' ? label : route.name)}
            onPress={onPress}
            style={styles.item}
          >
            <View style={[styles.indicator, focused && { backgroundColor: colors.accent }]}>
              <Text
                style={[
                  styles.label,
                  options.tabBarLabelStyle,
                  { color: focused ? colors.onAccent : colors.textSecondary },
                ]}
              >
                {typeof label === 'string' ? label : route.name}
              </Text>
            </View>
          </AppPressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row' },
  item: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  indicator: { minHeight: 32, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600' },
});
