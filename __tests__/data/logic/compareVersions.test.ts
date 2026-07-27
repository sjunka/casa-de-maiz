import { isBelowMinimumVersion } from '@data/logic/appUpdate/compareVersions';

test('an installed version below the minimum is below', () => {
  expect(isBelowMinimumVersion('1.0.0', '1.5.0')).toBe(true);
});

test('an installed version at or above the minimum is not below', () => {
  expect(isBelowMinimumVersion('1.5.0', '1.5.0')).toBe(false);
  expect(isBelowMinimumVersion('2.0.0', '1.5.0')).toBe(false);
});

test('compares numerically rather than lexically', () => {
  expect(isBelowMinimumVersion('1.10.0', '1.5.0')).toBe(false);
});
