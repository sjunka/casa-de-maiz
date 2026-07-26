import Config from 'react-native-config';

// Declared mapping from a destination key to the flag key that gates it.
// A destination key with no entry here is always visible.
const FEATURE_FLAG_REGISTRY: Record<string, string> = {
  reservations: 'enable_new_home',
};

const parseOverrides = (raw?: string): Record<string, boolean> => {
  const overrides: Record<string, boolean> = {};
  if (!raw) return overrides;

  for (const pair of raw.split(',')) {
    const [key, value] = pair.split('=').map(part => part.trim());
    if (key) {
      overrides[key] = value === 'true';
    }
  }

  return overrides;
};

// Local override for flag values, configured the same way as the base URL,
// so the flag gate can be demonstrated without editing the CMS.
const FEATURE_FLAG_OVERRIDES = parseOverrides(Config.FEATURE_FLAG_OVERRIDES);

export const isDestinationEnabled = (destinationKey: string, flags: Record<string, boolean>): boolean => {
  const flagKey = FEATURE_FLAG_REGISTRY[destinationKey];
  if (!flagKey) return true;

  const value = FEATURE_FLAG_OVERRIDES[flagKey] ?? flags[flagKey];
  return value === true;
};
