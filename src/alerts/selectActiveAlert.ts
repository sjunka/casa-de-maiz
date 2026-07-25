import type { Alert } from '../models/alert';

const SUPPORTED_PLACEMENT = 'topBar';
const SUPPORTED_TRIGGER = 'load';

const isSupported = (alert: Alert): boolean =>
  alert.placement === SUPPORTED_PLACEMENT && alert.trigger.type === SUPPORTED_TRIGGER;

const targetsPage = (alert: Alert, pageSlug: string): boolean =>
  alert.pageSlugs.length === 0 || alert.pageSlugs.includes(pageSlug);

// Unsupported placements/triggers render nothing rather than guessing; competing
// alerts for the same placement are ordered by priority.
export const selectActiveAlert = (
  alerts: Alert[],
  pageSlug: string,
  suppressedIds: ReadonlySet<string>,
): Alert | null => {
  const candidates = alerts
    .filter(alert => isSupported(alert) && targetsPage(alert, pageSlug) && !suppressedIds.has(alert.id))
    .sort((a, b) => b.priority - a.priority);

  return candidates[0] ?? null;
};
