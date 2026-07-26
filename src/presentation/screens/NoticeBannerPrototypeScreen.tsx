import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppPressable } from '../ui/AppPressable';
import { CollapsibleBanner } from '../ui/CollapsibleBanner';
import { useTheme } from '../theme/useTheme';
import type { ColorTokens } from '../theme/tokens';

// PROTOTYPE — throwaway. Answers one question: which notice banner treatment
// lets a hungry guest keep reading the menu while the kitchen still gets to
// say "we close at 22:30"? Delete once the answer is folded into
// OperationalNoticeBanner.

const MESSAGE = 'Kitchen closes at 22:30 tonight. Last orders 22:00.';

type Variant = 'slab' | 'card' | 'float';

const VARIANTS: { key: Variant; label: string; note: string }[] = [
  { key: 'slab', label: 'Slab', note: 'Shipped today: full-bleed bar, no motion, pushes the page down on arrival.' },
  { key: 'card', label: 'Card', note: 'Inset note card. Fades and grows in, collapses on dismiss so the page slides.' },
  { key: 'float', label: 'Float', note: 'Floats over the content: zero layout footprint, fades itself out after 5s.' },
];

export const NoticeBannerPrototypeScreen = () => {
  const { colors } = useTheme();
  const [variant, setVariant] = useState<Variant>('card');
  const [run, setRun] = useState(0);

  const active = VARIANTS.find(entry => entry.key === variant);

  return (
    <View style={styles.fill} testID="notice-banner-prototype">
      <View style={styles.fill}>
        {variant === 'slab' && <SlabVariant key={run} colors={colors} />}
        {variant === 'card' && <CardVariant key={run} colors={colors} />}
        {variant === 'float' && <FloatVariant key={run} colors={colors} />}

        <ScrollView contentContainerStyle={styles.page}>
          <Text style={[styles.heading, { color: colors.text }]}>Menu</Text>
          {['Tlayuda', 'Mole negro', 'Tamal de elote', 'Agua de horchata'].map(dish => (
            <View key={dish} style={[styles.row, { borderColor: colors.border }]}>
              <Text style={[styles.dish, { color: colors.text }]}>{dish}</Text>
              <Text style={[styles.price, { color: colors.textSecondary }]}>$180</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.bar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Text style={[styles.note, { color: colors.textSecondary }]}>{active?.note}</Text>
        <View style={styles.switcher}>
          {VARIANTS.map(entry => (
            <AppPressable
              key={entry.key}
              accessibilityRole="button"
              accessibilityLabel={`Show ${entry.label} variant`}
              style={[
                styles.chip,
                { borderColor: colors.border },
                entry.key === variant && { backgroundColor: colors.accentContainer, borderColor: colors.accent },
              ]}
              onPress={() => {
                setVariant(entry.key);
                setRun(previous => previous + 1);
              }}
            >
              <Text style={{ color: entry.key === variant ? colors.accent : colors.textSecondary }}>{entry.label}</Text>
            </AppPressable>
          ))}
          <AppPressable
            accessibilityRole="button"
            accessibilityLabel="Replay the banner"
            style={[styles.chip, { borderColor: colors.border }]}
            onPress={() => setRun(previous => previous + 1)}
          >
            <Text style={{ color: colors.textSecondary }}>Replay</Text>
          </AppPressable>
        </View>
      </View>
    </View>
  );
};

const SlabVariant = ({ colors }: { colors: ColorTokens }) => {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.slab, { backgroundColor: colors.infoBackground, paddingTop: 12 + top }]}>
      <Text style={[styles.slabMessage, { color: colors.infoText }]}>{MESSAGE}</Text>
    </View>
  );
};

const CardVariant = ({ colors }: { colors: ColorTokens }) => {
  const { top } = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) return null;

  return (
    <CollapsibleBanner visible={!dismissed} onExited={() => setCollapsed(true)}>
      <View style={[styles.card, { backgroundColor: colors.infoBackground, marginTop: 8 + top }]}>
        <View style={[styles.rule, { backgroundColor: colors.accent }]} />
        <Text style={[styles.cardMessage, { color: colors.infoText }]}>{MESSAGE}</Text>
        <AppPressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss notice"
          style={styles.dismiss}
          onPress={() => setDismissed(true)}
        >
          <Text style={[styles.dismissLabel, { color: colors.infoText }]}>×</Text>
        </AppPressable>
      </View>
    </CollapsibleBanner>
  );
};

const FloatVariant = ({ colors }: { colors: ColorTokens }) => {
  const { top } = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDismissed(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (collapsed) return null;

  return (
    <View style={[styles.floatLayer, { top: 8 + top }]} pointerEvents="box-none">
      <CollapsibleBanner visible={!dismissed} onExited={() => setCollapsed(true)}>
        <View style={[styles.float, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.cardMessage, { color: colors.text }]}>{MESSAGE}</Text>
        </View>
      </CollapsibleBanner>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  dish: { fontSize: 15 },
  price: { fontSize: 15 },

  slab: { padding: 12 },
  slabMessage: { fontSize: 13, textAlign: 'center' },

  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 8, borderRadius: 14, overflow: 'hidden' },
  rule: { width: 3, alignSelf: 'stretch' },
  cardMessage: { flex: 1, fontSize: 13, lineHeight: 18, paddingVertical: 14, paddingLeft: 12 },
  dismiss: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  dismissLabel: { fontSize: 18, opacity: 0.7 },

  floatLayer: { position: 'absolute', left: 0, right: 0, zIndex: 1 },
  float: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, paddingRight: 14, borderRadius: 14, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, marginLeft: 14 },

  bar: { borderTopWidth: 1, padding: 12 },
  note: { fontSize: 12, marginBottom: 8 },
  switcher: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 10, borderWidth: 1 },
});
