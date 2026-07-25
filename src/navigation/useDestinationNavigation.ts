import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { openDestination } from './openDestination';
import type { RootTabParamList } from './types';

export const useDestinationNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  return (pathOrHref: string) =>
    openDestination(pathOrHref, resolved => {
      if (resolved.screen === 'privacy') {
        navigation.navigate('privacy', { legalKey: resolved.legalKey });
      } else {
        navigation.navigate(resolved.screen);
      }
    });
};
