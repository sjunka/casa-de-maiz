import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Alert } from '../models/alert';
import { selectActiveAlert } from './selectActiveAlert';
import { isDismissed, recordDismissal } from './dismissal';
import { openDestination } from '../navigation/openDestination';
import { navigateToResolved } from '../navigation/navigationRef';

type Props = { alerts: Alert[]; currentPageSlug: string };

export const AlertBanner = ({ alerts, currentPageSlug }: Props) => {
  const [suppressedIds, setSuppressedIds] = useState<Set<string>>(new Set());
  const [visibleAlert, setVisibleAlert] = useState<Alert | null>(null);

  const candidate = selectActiveAlert(alerts, currentPageSlug, suppressedIds);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const checks = await Promise.all(
        alerts.map(async alert => {
          const cooldownHours = alert.frequency?.cooldownHours ?? 0;
          const dismissed = alert.dismissible && (await isDismissed(alert.id, cooldownHours));
          return [alert.id, dismissed] as const;
        }),
      );

      if (!cancelled) {
        const dismissedIds = checks.reduce<string[]>((ids, [id, dismissed]) => {
          if (dismissed) ids.push(id);
          return ids;
        }, []);
        setSuppressedIds(new Set(dismissedIds));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [alerts]);

  useEffect(() => {
    setVisibleAlert(null);
    if (!candidate) return;

    const timer = setTimeout(() => setVisibleAlert(candidate), candidate.trigger.delayMs ?? 0);
    return () => clearTimeout(timer);
    // Re-arm only when which alert is selected actually changes, not on every
    // render — `candidate` is a fresh object each render even for the same alert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id]);

  if (!visibleAlert) return null;

  const handleDismiss = () => {
    recordDismissal(visibleAlert.id);
    setSuppressedIds(previous => new Set(previous).add(visibleAlert.id));
  };

  return (
    <View style={styles.container} testID="alert-banner">
      <Text style={styles.message}>{visibleAlert.message}</Text>
      <View style={styles.actions}>
        {visibleAlert.actions.map(action => (
          <Pressable
            key={action.href}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => openDestination(action.href, navigateToResolved)}
          >
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
      {visibleAlert.dismissible && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          style={styles.dismiss}
          onPress={handleDismiss}
        >
          <Text style={styles.dismissLabel}>×</Text>
        </Pressable>
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
    backgroundColor: '#8a2c1d',
  },
  message: { flex: 1, color: '#fff', fontSize: 13 },
  actions: { flexDirection: 'row', marginLeft: 8 },
  actionLabel: { color: '#fff', fontWeight: '600', marginLeft: 12, fontSize: 13 },
  dismiss: { marginLeft: 12, minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  dismissLabel: { color: '#fff', fontSize: 18 },
});
