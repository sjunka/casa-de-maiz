import { useEffect, useState } from 'react';
import { CollapsibleBanner } from '../ui/CollapsibleBanner';
import { NoticeCard } from './NoticeCard';
import { useTheme } from '../theme/useTheme';
import { BANNER_AUTO_DISMISS_MS } from '../theme/motion';
import type { Alert } from '@core/contract/models/bootstrap/alert';
import { selectActiveAlerts } from '@data/logic/alerts/selectActiveAlert';
import { isSuppressed, recordDismissal, recordShown } from '@data/logic/alerts/frequency';
import { useScrollProgress } from './useScrollProgress';
import { openDestination } from '@navigation/destinations/openDestination';
import { navigateToResolved } from '@navigation/destinations/navigationRef';

type Props = { alerts: Alert[]; currentPageSlug: string };

// The topBar stack shows every alert the backend sends that qualifies for
// this page — not just the highest-priority one — each in its own card.
export const AlertBanner = ({ alerts, currentPageSlug }: Props) => {
  const [suppressedIds, setSuppressedIds] = useState<Set<string>>(new Set());
  const scrollPercent = useScrollProgress(currentPageSlug);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const checks = await Promise.all(
        alerts.map(async alert => [alert.id, await isSuppressed(alert)] as const),
      );

      if (!cancelled) {
        const nextSuppressedIds = checks.reduce<string[]>((ids, [id, suppressed]) => {
          if (suppressed) ids.push(id);
          return ids;
        }, []);
        setSuppressedIds(new Set(nextSuppressedIds));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [alerts]);

  const suppress = (id: string) => setSuppressedIds(previous => new Set(previous).add(id));

  const candidates = selectActiveAlerts(alerts, currentPageSlug, suppressedIds);

  return (
    <>
      {candidates.map(alert => (
        <AlertBannerItem key={alert.id} alert={alert} scrollPercent={scrollPercent} onSuppress={suppress} />
      ))}
    </>
  );
};

type ItemProps = { alert: Alert; scrollPercent: number; onSuppress: (id: string) => void };

const AlertBannerItem = ({ alert, scrollPercent, onSuppress }: ItemProps) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [exiting, setExiting] = useState(false);

  // A `scrollPercent` alert waits for the guest to reach its threshold on this
  // page; every other supported trigger is armed as soon as the page renders.
  const isArmed = alert.trigger.type !== 'scrollPercent' || scrollPercent >= (alert.trigger.scrollPercent ?? 0);

  useEffect(() => {
    if (!isArmed || shown) return;

    const timer = setTimeout(() => {
      setVisible(true);
      setShown(true);
      recordShown(alert);
    }, alert.trigger.delayMs ?? 0);
    return () => clearTimeout(timer);
    // Re-arm only when armed-ness changes, not on every render of the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArmed, shown]);

  // Evaluator-facing banners must auto-dismiss so a fresh install can be
  // verified without manually closing every card; a reload just re-shows it.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setExiting(true), BANNER_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  // The dismissal is recorded once the banner has finished collapsing, so the
  // space it hands back to the page animates instead of snapping shut.
  const handleExited = () => {
    recordDismissal(alert.id);
    onSuppress(alert.id);
  };

  return (
    <CollapsibleBanner visible={!exiting} onExited={handleExited}>
      <NoticeCard
        testID="alert-banner"
        icon="bell-outline"
        tint={colors.alertBackground}
        accent={colors.alertText}
        message={alert.message}
        dismissible={alert.dismissible}
        dismissLabel="Descartar alerta"
        onDismiss={() => setExiting(true)}
        actions={alert.actions.map(action => ({
          key: action.href,
          label: action.label,
          onPress: () => openDestination(action.href, navigateToResolved),
        }))}
      />
    </CollapsibleBanner>
  );
};
