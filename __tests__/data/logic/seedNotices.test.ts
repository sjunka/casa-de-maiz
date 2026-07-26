jest.mock('@core/contract/appVersion', () => ({ getAppVersion: () => '1.0.0' }));

import { seedNotices } from '@data/logic/seedNotices';
import type { Alert } from '@core/contract/models/alert';

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'from-backend',
  message: 'Backend alert',
  placement: 'topBar',
  trigger: { type: 'load' },
  dismissible: true,
  pageSlugs: [],
  priority: 0,
  actions: [],
  ...overrides,
});

test('an empty payload still yields all three notice kinds', () => {
  const seeded = seedNotices(undefined, []);

  expect(seeded.operationalControls.appUpdate?.policy).toBe('recommended');
  expect(seeded.operationalControls.mode).toBe('notice');
  expect(seeded.operationalControls.bannerMessage).toBeTruthy();
  expect(seeded.alerts).toHaveLength(1);
});

test('backend content wins over every seed', () => {
  const backendUpdate = { policy: 'recommended', message: 'Backend update' };
  const seeded = seedNotices(
    { mode: 'notice', bannerMessage: 'Backend notice', appUpdate: backendUpdate },
    [alert()],
  );

  expect(seeded.operationalControls.appUpdate).toEqual(backendUpdate);
  expect(seeded.operationalControls.bannerMessage).toBe('Backend notice');
  expect(seeded.alerts).toEqual([alert()]);
});

test('extra backend alerts are all kept, never trimmed to three', () => {
  const alerts = [alert({ id: 'a' }), alert({ id: 'b' }), alert({ id: 'c' }), alert({ id: 'd' })];
  expect(seedNotices(undefined, alerts).alerts).toEqual(alerts);
});

test('an appUpdate that would render nothing is replaced by the seed', () => {
  const seeded = seedNotices({ mode: 'notice', bannerMessage: 'Backend notice', appUpdate: { policy: 'none', message: '' } }, []);
  expect(seeded.operationalControls.appUpdate?.policy).toBe('recommended');
});

test('a required update the installed version fails is left untouched', () => {
  const required = { policy: 'required', minimumVersion: '2.0.0', message: 'Update now' };
  const seeded = seedNotices({ mode: 'notice', bannerMessage: 'Backend notice', appUpdate: required }, []);
  expect(seeded.operationalControls.appUpdate).toEqual(required);
});
