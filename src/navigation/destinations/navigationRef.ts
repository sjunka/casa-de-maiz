import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootTabParamList } from '../types';
import type { ResolvedDestination } from './resolveDestination';

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

type InternalDestination = Extract<ResolvedDestination, { kind: 'internal' }>;

let pendingDestination: InternalDestination | null = null;

const navigate = (resolved: InternalDestination): void => {
  if (resolved.screen === 'privacy') {
    navigationRef.navigate('privacy', { legalKey: resolved.legalKey });
  } else {
    navigationRef.navigate(resolved.screen);
  }
};

// Imperative navigation for callers (e.g. an alert action or a deep link) that
// render outside any screen and so cannot use the `useNavigation` hook. A
// destination arriving before the tab navigator has mounted (e.g. a cold-start
// deep link racing bootstrap) is held and replayed by `flushPendingNavigation`.
export const navigateToResolved = (resolved: InternalDestination): void => {
  if (!navigationRef.isReady()) {
    pendingDestination = resolved;
    return;
  }
  navigate(resolved);
};

export const flushPendingNavigation = (): void => {
  if (pendingDestination && navigationRef.isReady()) {
    const resolved = pendingDestination;
    pendingDestination = null;
    navigate(resolved);
  }
};

export const getCurrentRouteName = (): string | undefined =>
  navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
