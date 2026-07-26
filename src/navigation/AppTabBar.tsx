import { Platform, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppPressable } from '@presentation/ui/AppPressable';
import { GlassSurface } from '@presentation/ui/GlassSurface';
import { getElevatedSurfaceStyle } from '@presentation/theme/tokens';
import type { Theme } from '@presentation/theme/useTheme';
import type { Chrome } from '@presentation/prototype/chrome';
import { TabIcon } from './TabIcon';

type Props = BottomTabBarProps & { colors: Theme['colors']; scheme: Theme['scheme']; chrome: Chrome };

// One custom tab bar for both platforms. The `chrome.tabBar` variant decides the
// structure (flush / floating / compact rail); `Platform.OS` decides the
// material — a real UIVisualEffectView behind it on iOS, a tonal Material
// surface with an elevation and a tonal active indicator on Android (ADR 0012).
//
// react-navigation invokes `tabBar` as a plain function call, not as JSX
// (see BottomTabView's `tabBar({...})`), so this file avoids hooks entirely.
// Everything it needs is resolved by TabNavigator (a real component) and
// passed in — see the note there.
export const AppTabBar = ({ state, descriptors, navigation, insets, colors, scheme, chrome }: Props) => {
  const floating = chrome.tabBar === 'floating';
  const rail = chrome.tabBar === 'rail';
  const iconSize = rail ? 26 : 24;

  return (
    <View
      style={[
        styles.outer,
        floating ? [styles.floating, { marginBottom: insets.bottom + 12 }] : { paddingBottom: insets.bottom },
        Platform.OS === 'android' && getElevatedSurfaceStyle(colors),
      ]}
    >
      {Platform.OS === 'ios' && (
        <GlassSurface
          style={floating ? styles.floatingRadius : undefined}
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
              rippleColor={colors.accent}
              onPress={onPress}
              style={[styles.item, rail ? styles.itemRail : styles.itemTall]}
            >
              {/* Rail marks the active tab with a top line instead of a pill,
                  so the bar can stay 52pt tall and icon-only. */}
              {rail && <View style={[styles.railIndicator, focused && { backgroundColor: colors.accent }]} />}

              <View
                style={[
                  styles.indicator,
                  floating && styles.indicatorRow,
                  focused && !rail && { backgroundColor: colors.accentContainer },
                ]}
              >
                <TabIcon route={route.name} focused={focused} color={tint} size={iconSize} />
                {/* Floating shows the label only on the active tab, which lets the
                    bar shrink to a pill; anchored always shows it; rail never does
                    (the accessibility label still carries the name). */}
                {!rail && (!floating || focused) && (
                  <Text
                    numberOfLines={1}
                    style={[
                      floating ? styles.labelInline : styles.labelStacked,
                      options.tabBarLabelStyle,
                      { color: tint },
                    ]}
                  >
                    {text}
                  </Text>
                )}
              </View>
            </AppPressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { overflow: 'hidden' },
  floating: { marginHorizontal: 16, borderRadius: 28 },
  floatingRadius: { borderRadius: 28 },
  row: { flexDirection: 'row' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // 56/52 both clear the 44pt iOS and 48dp Android minimum touch targets.
  itemTall: { minHeight: 56, paddingVertical: 8 },
  itemRail: { minHeight: 52, justifyContent: 'flex-start' },
  railIndicator: { height: 3, alignSelf: 'stretch', marginBottom: 11, backgroundColor: 'transparent' },
  indicator: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  indicatorRow: { flexDirection: 'row', gap: 6 },
  labelStacked: { fontSize: 11, fontWeight: '600' },
  labelInline: { fontSize: 13, fontWeight: '600' },
});
