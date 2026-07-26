import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppPressable } from '../ui/AppPressable';
import { GlassSurface } from '../ui/GlassSurface';
import { useTheme } from '../theme/useTheme';
import type { Alert } from '@core/contract/models/alert';
import { selectActiveAlert } from '@data/state/selectActiveAlert';
import { isSuppressed, recordDismissal, recordShown } from '@data/state/frequency';
import { useScrollProgress } from './useScrollProgress';
import { openDestination } from '../../navigation/openDestination';
import { navigateToResolved } from '../../navigation/navigationRef';

type Props = { alerts: Alert[]; currentPageSlug: string };

export const AlertBanner = ({ alerts, currentPageSlug }: Props) => {
  const { top } = useSafeAreaInsets();
  const { colors, scheme } = useTheme();
  const [suppressedIds, setSuppressedIds] = useState<Set<string>>(new Set());
  const [visibleAlert, setVisibleAlert] = useState<Alert | null>(null);

  const scrollPercent = useScrollProgress(currentPageSlug);

  const candidate = selectActiveAlert(alerts, currentPageSlug, suppressedIds);

  // A `scrollPercent` alert waits for the guest to reach its threshold on this
  // page; every other supported trigger is armed as soon as the page renders.
  const isArmed =
    candidate?.trigger.type !== 'scrollPercent' || scrollPercent >= (candidate.trigger.scrollPercent ?? 0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const checks = await Promise.all(
        alerts.map(async alert => [alert.id, await isSuppressed(alert)] as const),
      );

      if (!cancelled) {
        const suppressedIds = checks.reduce<string[]>((ids, [id, suppressed]) => {
          if (suppressed) ids.push(id);
          return ids;
        }, []);
        setSuppressedIds(new Set(suppressedIds));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [alerts]);

  useEffect(() => {
    setVisibleAlert(null);
    if (!candidate || !isArmed) return;

    const timer = setTimeout(() => {
      setVisibleAlert(candidate);
      recordShown(candidate);
      if (candidate.frequency?.type === 'once' || candidate.frequency?.type === 'session') {
        setSuppressedIds(previous => new Set(previous).add(candidate.id));
      }
    }, candidate.trigger.delayMs ?? 0);
    return () => clearTimeout(timer);
    // Re-arm only when which alert is selected actually changes, not on every
    // render — `candidate` is a fresh object each render even for the same alert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id, isArmed]);

  if (!visibleAlert) return null;

  const handleDismiss = () => {
    recordDismissal(visibleAlert.id);
    setSuppressedIds(previous => new Set(previous).add(visibleAlert.id));
  };

  return (
    <View style={[styles.container, { paddingTop: 12 + top }]} testID="alert-banner">
      <GlassSurface
        blurType={scheme === 'dark' ? 'thinMaterialDark' : 'thinMaterialLight'}
        fallbackColor={colors.accent}
      />
      <View style={[styles.tint, { backgroundColor: colors.accent }]} />
      <Text style={[styles.message, { color: colors.onAccent }]}>{visibleAlert.message}</Text>
      <View style={styles.actions}>
        {visibleAlert.actions.map(action => (
          <AppPressable
            key={action.href}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={styles.action}
            onPress={() => openDestination(action.href, navigateToResolved)}
          >
            <Text style={[styles.actionLabel, { color: colors.onAccent }]}>{action.label}</Text>
          </AppPressable>
        ))}
      </View>
      {visibleAlert.dismissible && (
        <AppPressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          style={styles.dismiss}
          onPress={handleDismiss}
        >
          <Text style={[styles.dismissLabel, { color: colors.onAccent }]}>×</Text>
        </AppPressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  tint: { ...StyleSheet.absoluteFill, opacity: 0.82 },
  message: { flex: 1, fontSize: 13 },
  actions: { flexDirection: 'row', marginLeft: 8 },
  action: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  actionLabel: { fontWeight: '600', fontSize: 13 },
  dismiss: { marginLeft: 12, minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  dismissLabel: { fontSize: 18 },
});
