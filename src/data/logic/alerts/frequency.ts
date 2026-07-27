import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert } from '@core/contract/models/bootstrap/alert';

const storageKey = (alertId: string) => `alert-dismissed:${alertId}`;

type AlertRecord = { shownAt?: string; dismissedAt?: string };

// A shown-this-launch set, not React state: it must survive AlertBanner
// remounts (e.g. navigation) without persisting to disk.
const shownThisSession = new Set<string>();
const warnedFrequencyTypes = new Set<string>();

// Every launch opens with the full notice stack, so dismissals are cleared
// once per process start: a dismissal holds for the rest of the session but
// never carries across a restart.
export const resetDismissals = async (): Promise<void> => {
  const keys = await AsyncStorage.getAllKeys();
  const dismissals = keys.filter(key => key.startsWith('alert-dismissed:'));
  if (dismissals.length > 0) await AsyncStorage.removeMany(dismissals);
};

// `isSuppressed` awaits this rather than the app firing it at boot, so a
// banner can never read a stale record before the reset lands.
const launchReset = resetDismissals();

// Test-only: `shownThisSession` is module state with no equivalent at
// runtime (the app never restarts a session without restarting the
// process). Without this, an alert recorded `shown` by one test file stays
// suppressed for every test that runs after it in the same module registry.
export const resetSessionStateForTests = (): void => {
  shownThisSession.clear();
  warnedFrequencyTypes.clear();
};

const readRecord = async (alertId: string): Promise<AlertRecord> => {
  const raw = await AsyncStorage.getItem(storageKey(alertId));
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as AlertRecord;
  } catch {
    // Pre-existing stored value: a bare ISO timestamp from the old dismissal-only format.
  }

  return Number.isFinite(Date.parse(raw)) ? { dismissedAt: raw } : {};
};

const writeRecord = (alertId: string, record: AlertRecord): Promise<void> =>
  AsyncStorage.setItem(storageKey(alertId), JSON.stringify(record));

export const recordShown = async (alert: Alert): Promise<void> => {
  shownThisSession.add(alert.id);
  const record = await readRecord(alert.id);
  await writeRecord(alert.id, { ...record, shownAt: new Date().toISOString() });
};

export const recordDismissal = async (alertId: string): Promise<void> => {
  const record = await readRecord(alertId);
  await writeRecord(alertId, { ...record, dismissedAt: new Date().toISOString() });
};

const isDismissedWithinCooldown = (record: AlertRecord, cooldownHours: number): boolean => {
  if (!record.dismissedAt) return false;
  const dismissedAt = Date.parse(record.dismissedAt);
  if (!Number.isFinite(dismissedAt)) return false;
  return Date.now() - dismissedAt < cooldownHours * 60 * 60 * 1000;
};

export const isSuppressed = async (alert: Alert): Promise<boolean> => {
  await launchReset;
  const type = alert.frequency?.type;

  if (type === 'session') return shownThisSession.has(alert.id);

  if (type === 'once') return Boolean((await readRecord(alert.id)).shownAt);

  if (type !== undefined && type !== 'always' && !warnedFrequencyTypes.has(type)) {
    warnedFrequencyTypes.add(type);
    console.warn(`[alerts] unknown frequency type: ${type}`);
  }

  // 'always', unknown, or missing frequency: unchanged dismissal + cooldown gate.
  if (!alert.dismissible) return false;
  return isDismissedWithinCooldown(await readRecord(alert.id), alert.frequency?.cooldownHours ?? 0);
};
