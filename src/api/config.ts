import Config from 'react-native-config';

export const API_BASE_URL = Config.API_BASE_URL;

// Mocked is the default; a form submission only reaches the shared API when explicitly turned on.
export const ENABLE_LIVE_FORM_SUBMISSIONS = Config.ENABLE_LIVE_FORM_SUBMISSIONS === 'true';

// Crash reporting is disabled when no DSN is configured (e.g. local dev).
export const SENTRY_DSN = Config.SENTRY_DSN;
export const SENTRY_ENVIRONMENT = Config.SENTRY_ENVIRONMENT ?? 'development';
