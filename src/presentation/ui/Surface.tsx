import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Props = { children: React.ReactNode; style?: StyleProp<ViewStyle> };

// The card counterpart to the tab bar's platform split (ADR 0012). Both
// platforms stay opaque — blur behind scrolling content is expensive and
// hurts legibility over photography — but iOS reads as a distinct raised
// "pill" (larger radius, stronger shadow) while Android keeps a flatter,
// tighter shadow. Both use `boxShadow` (RN New Architecture), not the
// legacy `elevation`/`shadow*` keys.
export const Surface = ({ children, style }: Props) => {
  const { colors } = useTheme();

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.card, styles.raised, { backgroundColor: colors.surfaceElevated }, style]}>{children}</View>
    );
  }

  return (
    <View style={[styles.card, styles.framed, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // No `overflow: hidden` — it clips the iOS shadow. Children keep their own
  // radius and sit inside the padding instead of bleeding to the edge.
  card: { padding: 12 },
  raised: { borderRadius: 12, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)' },
  framed: {
    borderRadius: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.14)',
  },
});
