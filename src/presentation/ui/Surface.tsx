import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useChrome } from '../prototype/chrome';

type Props = { children: React.ReactNode; style?: StyleProp<ViewStyle> };

// The card counterpart to the tab bar's platform split (ADR 0012): cards stay
// opaque on both platforms — blur behind scrolling content is expensive and
// hurts legibility over photography — but they carry elevation the way each
// platform expects. Android gets a tonal surface plus `elevation`; iOS gets a
// hairline border and a soft shadow.
//
// PROTOTYPE: the radius/elevation tier comes from the active chrome variant.
// When a variant wins, inline its branch and drop the useChrome() call.
export const Surface = ({ children, style }: Props) => {
  const { colors } = useTheme();
  const { card } = useChrome();

  if (card === 'flat') {
    return <View style={[styles.flat, { borderColor: colors.border }, style]}>{children}</View>;
  }

  const framed = card === 'framed';
  const android = Platform.OS === 'android';
  const elevation = android
    ? framed
      ? styles.androidFramed
      : styles.androidRaised
    : framed
    ? styles.iosFramed
    : styles.iosRaised;

  return (
    <View
      style={[
        styles.card,
        framed ? styles.framed : styles.raised,
        android ? null : styles.ios,
        elevation,
        android
          ? { backgroundColor: colors.surfaceElevated }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flat: { paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  // No `overflow: hidden` — it clips the iOS shadow. Children keep their own
  // radius and sit inside the padding instead of bleeding to the edge.
  card: { padding: 12 },
  raised: { borderRadius: 12 },
  framed: { borderRadius: 20 },
  androidRaised: { elevation: 2 },
  androidFramed: { elevation: 4 },
  ios: { shadowColor: '#000' },
  iosRaised: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iosFramed: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12 },
});
