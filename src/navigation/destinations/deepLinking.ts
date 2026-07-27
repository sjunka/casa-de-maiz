import { Linking } from 'react-native';
import { resolveDestination } from './resolveDestination';
import { navigateToResolved } from './navigationRef';

const SCHEME = 'casamaiz://';

// Strips the app's own scheme down to the path shape `resolveDestination`
// already understands. Any other scheme is rejected outright.
const toResolverPath = (url: string): string | null => {
  if (!url.toLowerCase().startsWith(SCHEME)) return null;
  const path = `/${url.slice(SCHEME.length)}`.replace(/\/+$/, '');
  return path === '' ? '/' : path;
};

export const handleDeepLink = (url: string): void => {
  const path = toResolverPath(url);
  if (path === null) return;

  const resolved = resolveDestination(path);
  navigateToResolved(resolved.kind === 'internal' ? resolved : { kind: 'internal', screen: 'home' });
};

// Wires cold start (the app opened by a link) and warm start (the app was
// already backgrounded) onto the same handler. Returns an unsubscribe.
export const initDeepLinking = (): (() => void) => {
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink(url);
  });

  const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
  return () => subscription.remove();
};
