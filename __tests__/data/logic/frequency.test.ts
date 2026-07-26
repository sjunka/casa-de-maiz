jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSuppressed, recordDismissal, recordShown, resetDismissals } from '@data/logic/frequency';
import type { Alert } from '@core/contract/models/alert';

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'alert-1',
  message: 'msg',
  placement: 'topBar',
  trigger: { type: 'load' },
  dismissible: true,
  pageSlugs: [],
  priority: 0,
  actions: [],
  ...overrides,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('always', () => {
  const alwaysAlert = alert({ frequency: { type: 'always', cooldownHours: 24 } });

  test('is not suppressed when never dismissed', async () => {
    expect(await isSuppressed(alwaysAlert)).toBe(false);
  });

  test('is suppressed within cooldown after dismissal', async () => {
    await recordDismissal('alert-1');
    expect(await isSuppressed(alwaysAlert)).toBe(true);
  });

  test('is no longer suppressed once cooldown passes', async () => {
    await AsyncStorage.setItem(
      'alert-dismissed:alert-1',
      JSON.stringify({ dismissedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() }),
    );
    expect(await isSuppressed(alwaysAlert)).toBe(false);
  });

  test('being shown (not dismissed) does not suppress it', async () => {
    await recordShown(alwaysAlert);
    expect(await isSuppressed(alwaysAlert)).toBe(false);
  });
});

describe('once', () => {
  const onceAlert = alert({ frequency: { type: 'once' } });

  test('is not suppressed before it has ever been shown', async () => {
    expect(await isSuppressed(onceAlert)).toBe(false);
  });

  test('is suppressed forever after being shown, with no dismissal needed', async () => {
    await recordShown(onceAlert);
    expect(await isSuppressed(onceAlert)).toBe(true);
  });
});

describe('session', () => {
  const sessionAlert = alert({ id: 'alert-session', frequency: { type: 'session' } });

  test('is not suppressed before being shown this session', async () => {
    expect(await isSuppressed(sessionAlert)).toBe(false);
  });

  test('is suppressed after being shown this session, in memory only', async () => {
    await recordShown(sessionAlert);
    expect(await isSuppressed(sessionAlert)).toBe(true);
    expect(await AsyncStorage.getItem('alert-dismissed:alert-session')).not.toBeNull();
  });
});

describe('unknown or missing frequency type', () => {
  test('an unknown type behaves like always and never suppresses undismissed alerts', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const weirdAlert = alert({ frequency: { type: 'weird' } });
    expect(await isSuppressed(weirdAlert)).toBe(false);
  });

  test('a missing frequency behaves like always, with no cooldown to gate a dismissal', async () => {
    const noFrequencyAlert = alert({ frequency: undefined, id: 'alert-no-freq' });
    await recordDismissal('alert-no-freq');
    expect(await isSuppressed(noFrequencyAlert)).toBe(false);
  });
});

describe('launch reset', () => {
  test('clears persisted dismissals so a restart opens with the notice showing again', async () => {
    await recordDismissal('alert-1');
    expect(await isSuppressed(alert({ frequency: { type: 'always', cooldownHours: 24 } }))).toBe(true);

    await resetDismissals();

    expect(await isSuppressed(alert({ frequency: { type: 'always', cooldownHours: 24 } }))).toBe(false);
  });

  test('leaves storage that is not an alert dismissal alone', async () => {
    await AsyncStorage.setItem('feature-flag-override', 'on');
    await resetDismissals();
    expect(await AsyncStorage.getItem('feature-flag-override')).toBe('on');
  });
});

describe('legacy stored records', () => {
  test('a bare ISO string from the old format is read as a dismissal', async () => {
    await AsyncStorage.setItem('alert-dismissed:alert-1', new Date().toISOString());
    expect(await isSuppressed(alert({ frequency: { type: 'always', cooldownHours: 24 } }))).toBe(true);
  });

  test('a legacy record does not crash or suppress a `once` alert that was never shown', async () => {
    await AsyncStorage.setItem('alert-dismissed:alert-1', new Date().toISOString());
    expect(await isSuppressed(alert({ frequency: { type: 'once' } }))).toBe(false);
  });
});
