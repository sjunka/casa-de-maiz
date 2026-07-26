import { useSyncExternalStore } from 'react';
import { getScrollProgress, subscribeToScrollProgress } from '@data/logic/scrollProgress';

export const useScrollProgress = (owner: string): number =>
  useSyncExternalStore(subscribeToScrollProgress, () => getScrollProgress(owner));
