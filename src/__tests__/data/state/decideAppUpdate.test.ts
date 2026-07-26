import { decideAppUpdate } from '@data/state/decideAppUpdate';

test('no app-update configuration decides none', () => {
  expect(decideAppUpdate(undefined, '1.0.0')).toEqual({ kind: 'none' });
});

test('a recommended policy decides recommended regardless of version', () => {
  const appUpdate = { policy: 'recommended', minimumVersion: '1.5.0', message: 'Update available' };
  expect(decideAppUpdate(appUpdate, '1.0.0')).toEqual({ kind: 'recommended', message: 'Update available' });
});

test('a required policy below the minimum version decides required', () => {
  const appUpdate = { policy: 'required', minimumVersion: '1.5.0', message: 'Please update' };
  expect(decideAppUpdate(appUpdate, '1.0.0')).toEqual({ kind: 'required', message: 'Please update' });
});

test('a required policy at or above the minimum version decides none', () => {
  const appUpdate = { policy: 'required', minimumVersion: '1.5.0', message: 'Please update' };
  expect(decideAppUpdate(appUpdate, '1.5.0')).toEqual({ kind: 'none' });
});

test('a minimum version alone, without a required policy, never blocks', () => {
  const appUpdate = { policy: 'recommended', minimumVersion: '1.5.0', message: 'Update available' };
  expect(decideAppUpdate(appUpdate, '1.0.0')).not.toEqual({ kind: 'required', message: expect.any(String) });
});
