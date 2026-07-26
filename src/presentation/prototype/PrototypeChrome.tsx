// PROTOTYPE — throwaway. Owns the active chrome variant and renders the
// floating switcher over the app. Renders nothing but its children outside
// __DEV__, so a stray merge can't ship the bar to users.
//
// The switcher sits at the TOP of the screen, not the bottom the way a web
// prototype would: the bottom is exactly where the tab bar being evaluated
// lives, and a bar on top of it would hide the thing under test.
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppPressable } from '@presentation/ui/AppPressable';
import { ChromeContext, chromeFor, VARIANTS, VARIANT_NAMES, type Variant } from './chrome';

const step = (current: Variant, by: 1 | -1): Variant => {
  const next = (VARIANTS.indexOf(current) + by + VARIANTS.length) % VARIANTS.length;
  return VARIANTS[next];
};

export const PrototypeChromeProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useState<Variant>('A');
  const insets = useSafeAreaInsets();

  if (!__DEV__) {
    return children;
  }

  return (
    <ChromeContext.Provider value={chromeFor(variant)}>
      {children}
      <View style={[styles.bar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.pill}>
          <AppPressable
            accessibilityRole="button"
            accessibilityLabel="Previous prototype variant"
            hitSlop={12}
            onPress={() => setVariant(current => step(current, -1))}
            style={styles.arrow}
          >
            <Text style={styles.arrowLabel}>‹</Text>
          </AppPressable>
          <Text style={styles.label} numberOfLines={1}>
            {variant} — {VARIANT_NAMES[variant]}
          </Text>
          <AppPressable
            accessibilityRole="button"
            accessibilityLabel="Next prototype variant"
            hitSlop={12}
            onPress={() => setVariant(current => step(current, 1))}
            style={styles.arrow}
          >
            <Text style={styles.arrowLabel}>›</Text>
          </AppPressable>
        </View>
      </View>
    </ChromeContext.Provider>
  );
};

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  arrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  arrowLabel: { color: '#ffffff', fontSize: 22, lineHeight: 26 },
  label: { color: '#ffffff', fontSize: 13, fontWeight: '700', minWidth: 120, textAlign: 'center' },
});
