import { Platform, StyleSheet, type ViewStyle } from 'react-native';

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  accent: string;
  onAccent: string;
  // A tonal wash of `accent`, for active indicators and selected states that
  // need to read as "on" without inverting to a solid accent fill. `accent`
  // stays the foreground on top of it.
  accentContainer: string;
  border: string;
  imagePlaceholder: string;
  link: string;
  warningBackground: string;
  warningText: string;
  infoBackground: string;
  infoText: string;
  // The third notice tint, so an editorial alert is visibly a different kind of
  // thing from an app update (warning) or a service notice (info) without any
  // of the three raising its voice.
  alertBackground: string;
  alertText: string;
  errorText: string;
};

export const lightColors: ColorTokens = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceElevated: '#f6ece9',
  text: '#1a1a1a',
  textSecondary: '#666666',
  accent: '#8a2c1d',
  onAccent: '#ffffff',
  accentContainer: '#f6e3de',
  border: '#eeeeee',
  imagePlaceholder: '#eeeeee',
  link: '#0a5',
  warningBackground: '#fff3cd',
  warningText: '#664d03',
  // A warm tonal wash rather than the usual cold "info" blue — a service
  // notice belongs to the room, not to the operating system.
  infoBackground: '#f6e3de',
  infoText: '#5c2317',
  // Husk green — the other half of the maize palette, and the only cool tint in
  // the set, so it separates cleanly from the two warm ones.
  alertBackground: '#e9efe5',
  alertText: '#3b5133',
  errorText: '#cc0000',
};

export const darkColors: ColorTokens = {
  background: '#121212',
  surface: '#1e1e1e',
  surfaceElevated: '#2c2420',
  text: '#f2f2f2',
  textSecondary: '#aaaaaa',
  accent: '#d97a5f',
  onAccent: '#121212',
  accentContainer: '#3d241c',
  border: '#333333',
  imagePlaceholder: '#333333',
  link: '#4ade80',
  warningBackground: '#4a3b00',
  warningText: '#ffe58a',
  infoBackground: '#3d241c',
  infoText: '#f0d9d1',
  alertBackground: '#26301f',
  alertText: '#cfe0c4',
  errorText: '#ff6b6b',
};

// Android conveys elevation with a tonal surface and `elevation`; iOS conveys
// it with a hairline border and a soft shadow (ADR 0010, ADR 0012).
export const getElevatedSurfaceStyle = (colors: ColorTokens): ViewStyle =>
  Platform.OS === 'android'
    ? { backgroundColor: colors.surfaceElevated, elevation: 3 }
    : {
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      };
