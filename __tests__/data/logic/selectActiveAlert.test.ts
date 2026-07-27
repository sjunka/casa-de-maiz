import { selectActiveAlerts } from '@data/logic/alerts/selectActiveAlert';
import type { Alert } from '@core/contract/models/bootstrap/alert';

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
  expect(selectActiveAlerts(alerts, 'menu', new Set())).toEqual(alerts);
});

test('an alert targeting specific pages appears only on those pages', () => {
  const alerts = [alert({ pageSlugs: ['home'] })];
  expect(selectActiveAlerts(alerts, 'home', new Set())).toEqual(alerts);
  expect(selectActiveAlerts(alerts, 'menu', new Set())).toEqual([]);
});

test('several qualifying alerts all appear, ordered by priority', () => {
  const low = alert({ id: 'low', priority: 1 });
  const high = alert({ id: 'high', priority: 100 });
  expect(selectActiveAlerts([low, high], 'home', new Set())).toEqual([high, low]);
});

test('an unsupported placement renders nothing', () => {
  const alerts = [alert({ placement: 'modal' })];
  expect(selectActiveAlerts(alerts, 'home', new Set())).toEqual([]);
});

test('an unsupported trigger renders nothing', () => {
  const alerts = [alert({ trigger: { type: 'timeOnPage', afterMs: 5000 } as Alert['trigger'] })];
  expect(selectActiveAlerts(alerts, 'home', new Set())).toEqual([]);
});

test('a scrollPercent trigger is selectable — arming is the banner’s job', () => {
  const alerts = [alert({ trigger: { type: 'scrollPercent', scrollPercent: 30 } })];
  expect(selectActiveAlerts(alerts, 'home', new Set())).toEqual(alerts);
});

test('a suppressed (dismissed, in-cooldown) alert is excluded', () => {
  const alerts = [alert({ id: 'alert-1' })];
  expect(selectActiveAlerts(alerts, 'home', new Set(['alert-1']))).toEqual([]);
});
