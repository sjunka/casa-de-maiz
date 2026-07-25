import Config from 'react-native-config';

export const API_BASE_URL = Config.API_BASE_URL;

// Mocked is the default; a form submission only reaches the shared API when explicitly turned on.
export const ENABLE_LIVE_FORM_SUBMISSIONS = Config.ENABLE_LIVE_FORM_SUBMISSIONS === 'true';
