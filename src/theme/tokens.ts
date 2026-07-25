export type ColorTokens = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  onAccent: string;
  border: string;
  imagePlaceholder: string;
  link: string;
  warningBackground: string;
  warningText: string;
  infoBackground: string;
  infoText: string;
  errorText: string;
};

export const lightColors: ColorTokens = {
  background: '#ffffff',
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  accent: '#8a2c1d',
  onAccent: '#ffffff',
  border: '#eeeeee',
  imagePlaceholder: '#eeeeee',
  link: '#0a5',
  warningBackground: '#fff3cd',
  warningText: '#664d03',
  infoBackground: '#e6f0ff',
  infoText: '#1a1a1a',
  errorText: '#cc0000',
};

export const darkColors: ColorTokens = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#f2f2f2',
  textSecondary: '#aaaaaa',
  accent: '#d97a5f',
  onAccent: '#121212',
  border: '#333333',
  imagePlaceholder: '#333333',
  link: '#4ade80',
  warningBackground: '#4a3b00',
  warningText: '#ffe58a',
  infoBackground: '#1c2a3d',
  infoText: '#f2f2f2',
  errorText: '#ff6b6b',
};
