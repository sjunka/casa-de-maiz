declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL: string;
    FEATURE_FLAG_OVERRIDES?: string;
    ENABLE_LIVE_FORM_SUBMISSIONS?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
