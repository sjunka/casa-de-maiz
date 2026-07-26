import { StyleSheet, Text, View } from 'react-native';
import { AppPressable } from '../../ui/AppPressable';

type Props = {
  variants: { key: string; name: string }[];
  index: number;
  onChange: (index: number) => void;
};

// PROTOTYPE-ONLY chrome (mattpocock-skills:prototype UI.md) — a floating bar
// to flip between the three FormBlock look-and-feel variants. Deliberately
// high-contrast/dark so it never reads as part of the design being judged.
// Never rendered outside __DEV__ (FormFixtureScreen is a dev-only route).
export const PrototypeSwitcher = ({ variants, index, onChange }: Props) => {
  const current = variants[index];
  const cycle = (delta: number) => onChange((index + delta + variants.length) % variants.length);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        <AppPressable accessibilityRole="button" accessibilityLabel="Previous variant" onPress={() => cycle(-1)} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </AppPressable>
        <Text style={styles.label}>
          {String.fromCharCode(65 + index)} — {current.name}
        </Text>
        <AppPressable accessibilityRole="button" accessibilityLabel="Next variant" onPress={() => cycle(1)} style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </AppPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 8, alignItems: 'center', zIndex: 999 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111ee',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.35)',
  },
  arrow: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#ffffff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  label: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
});
