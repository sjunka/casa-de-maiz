import { useSyncExternalStore } from 'react';
import { darkColors, lightColors, type ColorTokens } from './tokens';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
};

// App defaults to light. The toggle button is the only way to switch to dark —
// deliberately not persisted, so it resets to light on next launch.
let override: Theme['scheme'] = 'light';
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
  const scheme = useSyncExternalStore(subscribe, () => override);
  return { scheme, colors: scheme === 'dark' ? darkColors : lightColors };
};
