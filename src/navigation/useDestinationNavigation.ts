import { Linking } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { resolveDestination } from './resolveDestination';
import type { RootTabParamList } from './types';

export const useDestinationNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  return async (pathOrHref: string) => {
    const resolved = resolveDestination(pathOrHref);

    if (resolved.kind === 'internal') {
      if (resolved.screen === 'privacy') {
        navigation.navigate('privacy', { legalKey: resolved.legalKey });
      } else {
        navigation.navigate(resolved.screen);
      }
      return;
    }

    if (resolved.kind === 'external') {
      const canOpen = await Linking.canOpenURL(resolved.url);
      if (canOpen) {
        await Linking.openURL(resolved.url);
      }
    }
  };
};
