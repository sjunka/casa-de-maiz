import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { AppPressable } from '../ui/AppPressable';
import { useTheme } from '../theme/useTheme';
import { MIN_TOUCH_TARGET } from '../theme/tokens';
import { UNDO_MS } from '../theme/motion';
import { useReducedMotion } from '../theme/useReducedMotion';
import { noticeCardStrings } from './noticeCardStrings';

type Glyph = React.ComponentProps<typeof MaterialDesignIcons>['name'];

type Action = { key: string; label: string; onPress: () => void };

// The close glyph is small on purpose; `hitSlop` is what carries it up to the
// platform minimum tap target.
const DISMISS_SIZE = 20;

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
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  // Dismissing swaps the card for an undo row in the same slot, so nothing
  // below it moves until the dismissal is real. The notice itself is gone
  // from the moment of the tap — the row is only the window to take it back.
  const dismiss = () => {
    setPending(true);
    AccessibilityInfo.announceForAccessibility(noticeCardStrings.dismissed);
    timer.current = setTimeout(() => onDismiss?.(), UNDO_MS);
  };

  const undo = () => {
    clearTimeout(timer.current ?? undefined);
    setPending(false);
    AccessibilityInfo.announceForAccessibility(noticeCardStrings.restoredAnnouncement);
  };

  if (pending) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.undoRow, { backgroundColor: tint }]} testID={testID ? `${testID}-undo` : undefined}>
          <Text style={[styles.undoMessage, { color: accent }]}>{noticeCardStrings.dismissed}</Text>
          <AppPressable
            accessibilityRole="button"
            accessibilityLabel={noticeCardStrings.undoAccessibilityLabel}
            style={styles.undoAction}
            onPress={undo}
          >
            <Text style={[styles.undoLabel, { color: accent }]}>{noticeCardStrings.undo}</Text>
          </AppPressable>
          <UndoDrain color={accent} />
        </View>
      </View>
    );
  }

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
              hitSlop={(MIN_TOUCH_TARGET - DISMISS_SIZE) / 2}
              onPress={dismiss}
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

// The undo window has to be visible or the notice leaving on its own reads as
// a glitch: a hairline rule drains for exactly as long as the undo lives.
const UndoDrain = ({ color }: { color: string }) => {
  const remaining = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    remaining.value = withTiming(0, { duration: reducedMotion ? 0 : UNDO_MS, easing: Easing.linear });
  }, [remaining, reducedMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: remaining.value }] }));

  return <Animated.View style={[styles.drain, { backgroundColor: color }, style]} />;
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
  dismiss: {
    marginLeft: 8,
    width: DISMISS_SIZE,
    height: DISMISS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginLeft: 34 },
  action: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontWeight: '600', fontSize: 13 },
  undoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
    minHeight: 52,
    overflow: 'hidden',
  },
  undoMessage: { flex: 1, fontSize: 14, fontWeight: '500' },
  undoAction: { minHeight: MIN_TOUCH_TARGET, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  undoLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  drain: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, opacity: 0.35, transformOrigin: 'left' },
});
