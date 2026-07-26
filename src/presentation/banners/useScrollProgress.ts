import { useSyncExternalStore } from 'react';
import { getScrollProgress, subscribeToScrollProgress } from '@data/state/scrollProgress';

export const useScrollProgress = (owner: string): number =>
  useSyncExternalStore(subscribeToScrollProgress, () => getScrollProgress(owner));
