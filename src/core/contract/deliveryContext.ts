import { Platform } from 'react-native';
import { getAppVersion } from './appVersion';

export type DeliveryContext = {
  platform: string;
  market: 'MX';
  audience: 'guest';
  appVersion: string;
};

export const buildDeliveryContext = (): DeliveryContext => ({
  platform: Platform.OS,
  market: 'MX',
  audience: 'guest',
  appVersion: getAppVersion(),
});
