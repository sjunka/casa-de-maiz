import { StyleSheet, Text, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { AppPressable } from '../ui/AppPressable';
import { useTheme } from '../theme/useTheme';

type Glyph = React.ComponentProps<typeof MaterialDesignIcons>['name'];

type Action = { key: string; label: string; onPress: () => void };

type Props = {
  icon: Glyph;
  // `tint` is the card's own soft wash and `accent` the readable ink on it —
  // one pair per notice kind, so the three kinds are told apart by colour
  // without any of them shouting.
  tint: string;
  accent: string;
  message: string;
  actions?: Action[];
  dismissible?: boolean;
  dismissLabel: string;
  onDismiss?: () => void;
  testID?: string;
};

// One card shape for every top-of-screen notice (update, operational, alert).
// A notice should register, not alarm — so the tint carries the whole signal
// and the dismiss control stays a small, low-contrast glyph rather than a
// bold button competing with the message.
export const NoticeCard = ({
  icon,
  tint,
  accent,
  message,
  actions = [],
  dismissible,
  dismissLabel,
  onDismiss,
  testID,
}: Props) => {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, { backgroundColor: tint }]} testID={testID}>
        <View style={styles.header}>
          <View style={[styles.iconChip, { backgroundColor: accent }]}>
            <MaterialDesignIcons name={icon} size={14} color={tint} />
          </View>
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          {dismissible && (
            <AppPressable
              accessibilityRole="button"
              accessibilityLabel={dismissLabel}
              style={styles.dismiss}
              hitSlop={12}
              onPress={onDismiss}
            >
              <MaterialDesignIcons name="close" size={14} color={colors.textSecondary} />
            </AppPressable>
          )}
        </View>

        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map(action => (
              <AppPressable
                key={action.key}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={[styles.action, { borderColor: accent }]}
                onPress={action.onPress}
              >
                <Text style={[styles.actionLabel, { color: accent }]}>{action.label}</Text>
              </AppPressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 12, paddingTop: 8 },
  card: { borderRadius: 14, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  iconChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  message: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: '500' },
  dismiss: { marginLeft: 8, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginLeft: 34 },
  action: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontWeight: '600', fontSize: 13 },
});
