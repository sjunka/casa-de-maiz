const HTTPS_URL = /^https:\/\//i;
const ANY_SCHEME_URL = /^[a-z][a-z0-9+.-]*:\/\//i;
const LEGAL_PATH = /^\/legal\/([^/]+)$/;

export type ResolvedDestination =
  | { kind: 'internal'; screen: 'home' }
  | { kind: 'internal'; screen: 'menu' }
  | { kind: 'internal'; screen: 'privacy'; legalKey: string }
  | { kind: 'internal'; screen: 'reservations' }
  | { kind: 'external'; url: string }
  | { kind: 'unsupported' };

export const resolveDestination = (pathOrHref: string): ResolvedDestination => {
  if (ANY_SCHEME_URL.test(pathOrHref)) {
    return HTTPS_URL.test(pathOrHref) ? { kind: 'external', url: pathOrHref } : { kind: 'unsupported' };
  }

  if (pathOrHref === '/') {
    return { kind: 'internal', screen: 'home' };
  }

  if (pathOrHref === '/menu') {
    return { kind: 'internal', screen: 'menu' };
  }

  if (pathOrHref === '/reservas') {
    return { kind: 'internal', screen: 'reservations' };
  }

  const legalMatch = pathOrHref.match(LEGAL_PATH);
  if (legalMatch) {
    return { kind: 'internal', screen: 'privacy', legalKey: legalMatch[1] };
  }

  return { kind: 'unsupported' };
};
