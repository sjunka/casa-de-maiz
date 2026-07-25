import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = (alertId: string) => `alert-dismissed:${alertId}`;

export const isDismissed = async (alertId: string, cooldownHours: number): Promise<boolean> => {
  const raw = await AsyncStorage.getItem(storageKey(alertId));
  if (!raw) return false;

  const dismissedAt = Date.parse(raw);
  if (!Number.isFinite(dismissedAt)) return false;

  return Date.now() - dismissedAt < cooldownHours * 60 * 60 * 1000;
};

export const recordDismissal = (alertId: string): Promise<void> =>
  AsyncStorage.setItem(storageKey(alertId), new Date().toISOString());
