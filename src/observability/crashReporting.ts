import type React from 'react';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import { getAppVersion } from '@core/contract/appVersion';
import { buildDeliveryContext } from '@core/contract/deliveryContext';

// Crash reporting is disabled when no DSN is configured (e.g. local dev).
const SENTRY_DSN = Config.SENTRY_DSN;
const SENTRY_ENVIRONMENT = Config.SENTRY_ENVIRONMENT ?? 'development';

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

export const wrapRootComponent = (
  component: React.ComponentType<Record<string, unknown>>,
) => (SENTRY_DSN ? Sentry.wrap(component) : component);
