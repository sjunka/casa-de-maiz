import { Linking } from 'react-native';
import { resolveDestination, type ResolvedDestination } from './resolveDestination';

type InternalDestination = Extract<ResolvedDestination, { kind: 'internal' }>;

export const openDestination = async (
  pathOrHref: string,
  navigateInternal: (resolved: InternalDestination) => void,
): Promise<void> => {
  const resolved = resolveDestination(pathOrHref);

  if (resolved.kind === 'internal') {
    navigateInternal(resolved);
    return;
  }

  if (resolved.kind === 'external') {
    const canOpen = await Linking.canOpenURL(resolved.url);
    if (canOpen) {
      await Linking.openURL(resolved.url);
    }
  }
};
