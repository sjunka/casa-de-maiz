import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorTokens } from './tokens';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
};

// Dev/demo affordance: a manual override so a reviewer can try dark mode
// without leaving the app for system settings. Deliberately not persisted — it
// dies with the process and the app falls back to the system scheme.
let override: Theme['scheme'] | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const toggleSchemeOverride = (current: Theme['scheme']) => {
  override = current === 'dark' ? 'light' : 'dark';
  listeners.forEach(listener => listener());
};

export const useTheme = (): Theme => {
  const systemScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const scheme = useSyncExternalStore(subscribe, () => override) ?? systemScheme;
  return { scheme, colors: scheme === 'dark' ? darkColors : lightColors };
};
