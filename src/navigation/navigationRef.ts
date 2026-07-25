import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootTabParamList } from './types';
import type { ResolvedDestination } from './resolveDestination';

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

type InternalDestination = Extract<ResolvedDestination, { kind: 'internal' }>;

// Imperative navigation for callers (e.g. an alert action) that render outside
// any screen and so cannot use the `useNavigation` hook.
export const navigateToResolved = (resolved: InternalDestination): void => {
  if (!navigationRef.isReady()) return;

  if (resolved.screen === 'privacy') {
    navigationRef.navigate('privacy', { legalKey: resolved.legalKey });
  } else {
    navigationRef.navigate(resolved.screen);
  }
};

export const getCurrentRouteName = (): string | undefined =>
  navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
