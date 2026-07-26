import type { Alert } from '@core/contract/models/alert';

const SUPPORTED_PLACEMENT = 'topBar';
const SUPPORTED_TRIGGERS = ['load', 'scrollPercent'];

const isSupported = (alert: Alert): boolean =>
  alert.placement === SUPPORTED_PLACEMENT && SUPPORTED_TRIGGERS.includes(alert.trigger.type);

const targetsPage = (alert: Alert, pageSlug: string): boolean =>
  alert.pageSlugs.length === 0 || alert.pageSlugs.includes(pageSlug);

// Unsupported placements/triggers render nothing rather than guessing. The
// topBar stack shows every qualifying alert at once (ordered by priority),
// not just the top one — each one gets its own card.
export const selectActiveAlerts = (
  alerts: Alert[],
  pageSlug: string,
  suppressedIds: ReadonlySet<string>,
): Alert[] =>
  alerts
    .filter(alert => isSupported(alert) && targetsPage(alert, pageSlug) && !suppressedIds.has(alert.id))
    .sort((a, b) => b.priority - a.priority);
