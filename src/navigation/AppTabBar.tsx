import { Platform, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppPressable } from '@presentation/ui/AppPressable';
import { GlassSurface } from '@presentation/ui/GlassSurface';
import { getElevatedSurfaceStyle } from '@presentation/theme/tokens';
import type { Theme } from '@presentation/theme/useTheme';
import { TabIcon } from './TabIcon';

type Props = BottomTabBarProps & { colors: Theme['colors']; scheme: Theme['scheme'] };

// One custom tab bar for both platforms: icon-only, active tab marked by a
// top indicator line rather than a label or a filled pill. iOS and Android
// share this structure by design — only the material behind it diverges
// (a real UIVisualEffectView on iOS, a tonal Material surface with elevation
// on Android, ADR 0012). Ripple is disabled here (AppPressable's
// `disableRipple`) since the indicator line already carries the tap/focus
// feedback; iOS still gets AppPressable's opacity-on-press.
//
// react-navigation invokes `tabBar` as a plain function call, not as JSX
// (see BottomTabView's `tabBar({...})`), so this file avoids hooks entirely.
// Everything it needs is resolved by TabNavigator (a real component) and
// passed in — see the note there.
export const AppTabBar = ({ state, descriptors, navigation, insets, colors, scheme }: Props) => {
  return (
    <View
      style={[styles.outer, { paddingBottom: insets.bottom }, Platform.OS === 'android' && getElevatedSurfaceStyle(colors)]}
    >
      {Platform.OS === 'ios' && (
        <GlassSurface
          blurType={scheme === 'dark' ? 'thinMaterialDark' : 'thinMaterialLight'}
          fallbackColor={colors.surface}
        />
      )}

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const text = typeof label === 'string' ? label : route.name;
          const focused = state.index === index;
          const tint = focused ? colors.accent : colors.textSecondary;

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
              accessibilityLabel={options.tabBarAccessibilityLabel ?? text}
              disableRipple
              onPress={onPress}
              style={styles.item}
            >
              <View style={[styles.indicatorLine, focused && { backgroundColor: colors.accent }]} />
              <TabIcon route={route.name} focused={focused} color={tint} size={26} />
            </AppPressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { overflow: 'hidden' },
  row: { flexDirection: 'row' },
  // 52pt clears the 44pt iOS / 48dp Android minimum touch target.
  item: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'flex-start' },
  indicatorLine: { height: 3, alignSelf: 'stretch', marginBottom: 11, backgroundColor: 'transparent' },
});
