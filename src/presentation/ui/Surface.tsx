import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Props = { children: React.ReactNode; style?: StyleProp<ViewStyle> };

// The card counterpart to the tab bar's platform split (ADR 0012). Both
// platforms stay opaque — blur behind scrolling content is expensive and
// hurts legibility over photography — but iOS reads as a distinct raised
// "pill" (larger radius, stronger shadow) while Android keeps the flatter
// Material elevation convention.
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
  raised: { borderRadius: 12, elevation: 2 },
  framed: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
});
