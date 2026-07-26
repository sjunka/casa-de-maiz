import { Platform } from 'react-native';
import { getElevatedSurfaceStyle, lightColors } from '@presentation/theme/tokens';

test('android resolves elevation as a tonal surface with `elevation`', () => {
  Platform.OS = 'android';
  expect(getElevatedSurfaceStyle(lightColors)).toEqual({
    backgroundColor: lightColors.surfaceElevated,
    elevation: 3,
  });
});

test('ios resolves elevation as a bordered, shadowed surface', () => {
  Platform.OS = 'ios';
  const style = getElevatedSurfaceStyle(lightColors);
  expect(style).toMatchObject({ backgroundColor: lightColors.surface, shadowOpacity: 0.08 });
  expect(style).not.toHaveProperty('elevation');
});

test('the minimum tap target follows each platform guideline', () => {
  const load = (os: 'ios' | 'android') => {
    let value = 0;
    jest.isolateModules(() => {
      Platform.OS = os;
      value = require('@presentation/theme/tokens').MIN_TOUCH_TARGET;
    });
    return value;
  };

  expect(load('android')).toBe(48); // Material
  expect(load('ios')).toBe(44); // HIG
});
