import { act, renderHook } from '@testing-library/react-native';
import { toggleSchemeOverride, useTheme } from '@presentation/theme/useTheme';
import { darkColors, lightColors } from '@presentation/theme/tokens';

test('defaults to light tokens', async () => {
  const { result } = await renderHook(() => useTheme());
  expect(result.current.scheme).toBe('light');
  expect(result.current.colors).toEqual(lightColors);
});

test('toggling the override switches to dark, and back', async () => {
  const { result } = await renderHook(() => useTheme());

  await act(async () => toggleSchemeOverride(result.current.scheme));
  expect(result.current.scheme).toBe('dark');
  expect(result.current.colors).toEqual(darkColors);

  await act(async () => toggleSchemeOverride(result.current.scheme));
  expect(result.current.scheme).toBe('light');
});
