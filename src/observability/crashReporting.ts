import * as Sentry from '@sentry/react-native';
import { getAppVersion } from '@core/contract/appVersion';
import { buildDeliveryContext } from '@core/contract/deliveryContext';
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from '@core/transport/config';

export const initCrashReporting = (): void => {
  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
  });

  const { platform } = buildDeliveryContext();
  Sentry.setTag('app_version', getAppVersion());
  Sentry.setTag('platform', platform);
};

export type TransportErrorContext = {
  endpoint: string;
  status?: number;
  kind: string;
};

export const reportTransportError = (
  error: Error,
  context: TransportErrorContext,
): void => {
  Sentry.captureException(error, { tags: context });
};

export const reportUnknownBlock = (blockType: string): void => {
  Sentry.addBreadcrumb({
    category: 'blocks',
    message: `unknown or invalid block type: ${blockType}`,
    level: 'warning',
  });
};

export const wrapRootComponent = Sentry.wrap;
