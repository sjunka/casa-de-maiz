import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type Progress = { owner: string; percent: number };

// AlertBanner renders above the navigator, outside every screen's ScrollView, so
// scroll position has to travel out of band — same module-singleton approach as
// `navigationRef`. Keyed by owner so a percent reached on Home cannot arm an
// alert on Menu, and monotonic per owner so scrolling back up never un-arms an
// alert that already qualified.
let progress: Progress = { owner: '', percent: 0 };
const listeners = new Set<() => void>();

const publish = (next: Progress) => {
  if (next.owner === progress.owner && next.percent <= progress.percent) return;
  progress = next.owner === progress.owner ? { ...next, percent: Math.max(progress.percent, next.percent) } : next;
  listeners.forEach(listener => listener());
};

export const scrollPercentOf = (event: NativeSyntheticEvent<NativeScrollEvent>): number => {
  const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
  const scrollable = contentSize.height - layoutMeasurement.height;
  if (scrollable <= 0) return 0;
  return Math.min(100, Math.max(0, (contentOffset.y / scrollable) * 100));
};

export const trackScrollProgress =
  (owner: string) =>
  (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    publish({ owner, percent: scrollPercentOf(event) });
  };

export const resetScrollProgress = () => {
  progress = { owner: '', percent: 0 };
  listeners.forEach(listener => listener());
};

// Exposed for `useScrollProgress` (presentation layer) to subscribe React's
// external-store hook to — the store itself has no React dependency.
export const subscribeToScrollProgress = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getScrollProgress = (owner: string): number =>
  progress.owner === owner ? progress.percent : 0;
