const mockUseColorScheme = jest.fn();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockUseColorScheme(),
}));

import { act, renderHook } from '@testing-library/react-native';
import { toggleSchemeOverride, useTheme } from '@presentation/theme/useTheme';
import { darkColors, lightColors } from '@presentation/theme/tokens';

test('follows the system scheme into light tokens', async () => {
  mockUseColorScheme.mockReturnValue('light');
  const { result } = await renderHook(() => useTheme());
  expect(result.current.scheme).toBe('light');
  expect(result.current.colors).toEqual(lightColors);
});

test('follows the system scheme into dark tokens', async () => {
  mockUseColorScheme.mockReturnValue('dark');
  const { result } = await renderHook(() => useTheme());
  expect(result.current.scheme).toBe('dark');
  expect(result.current.colors).toEqual(darkColors);
});

test('falls back to light when the system reports no preference', async () => {
  mockUseColorScheme.mockReturnValue(null);
  const { result } = await renderHook(() => useTheme());
  expect(result.current.scheme).toBe('light');
});

test('a manual override wins over the system scheme, and toggles back', async () => {
  mockUseColorScheme.mockReturnValue('light');
  const { result } = await renderHook(() => useTheme());

  await act(async () => toggleSchemeOverride(result.current.scheme));
  expect(result.current.scheme).toBe('dark');
  expect(result.current.colors).toEqual(darkColors);

  await act(async () => toggleSchemeOverride(result.current.scheme));
  expect(result.current.scheme).toBe('light');
});
