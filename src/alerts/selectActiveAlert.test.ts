import { selectActiveAlert } from './selectActiveAlert';
import type { Alert } from '../models/alert';

const alert = (overrides: Partial<Alert>): Alert => ({
  id: 'alert-1',
  message: 'Notice',
  placement: 'topBar',
  trigger: { type: 'load', delayMs: 3000 },
  dismissible: true,
  pageSlugs: [],
  priority: 0,
  actions: [],
  ...overrides,
});

test('an alert targeting no pages appears everywhere', () => {
  const alerts = [alert({ pageSlugs: [] })];
  expect(selectActiveAlert(alerts, 'menu', new Set())).toEqual(alerts[0]);
});

test('an alert targeting specific pages appears only on those pages', () => {
  const alerts = [alert({ pageSlugs: ['home'] })];
  expect(selectActiveAlert(alerts, 'home', new Set())).toEqual(alerts[0]);
  expect(selectActiveAlert(alerts, 'menu', new Set())).toBeNull();
});

test('competing alerts are ordered by priority', () => {
  const low = alert({ id: 'low', priority: 1 });
  const high = alert({ id: 'high', priority: 100 });
  expect(selectActiveAlert([low, high], 'home', new Set())).toEqual(high);
});

test('an unsupported placement renders nothing', () => {
  const alerts = [alert({ placement: 'modal' })];
  expect(selectActiveAlert(alerts, 'home', new Set())).toBeNull();
});

test('an unsupported trigger renders nothing', () => {
  const alerts = [alert({ trigger: { type: 'scrollPercent', scrollPercent: 30 } as Alert['trigger'] })];
  expect(selectActiveAlert(alerts, 'home', new Set())).toBeNull();
});

test('a suppressed (dismissed, in-cooldown) alert is excluded', () => {
  const alerts = [alert({ id: 'alert-1' })];
  expect(selectActiveAlert(alerts, 'home', new Set(['alert-1']))).toBeNull();
});
