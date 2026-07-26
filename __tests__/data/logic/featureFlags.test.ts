import { isDestinationEnabled } from '@data/logic/featureFlags';

test('a destination with no mapped flag is always visible', () => {
  expect(isDestinationEnabled('home', {})).toBe(true);
  expect(isDestinationEnabled('menu', { enable_new_home: false })).toBe(true);
});

test('a destination mapped to an enabled flag is visible', () => {
  expect(isDestinationEnabled('reservations', { enable_new_home: true })).toBe(true);
});

test('a destination mapped to a disabled flag disappears', () => {
  expect(isDestinationEnabled('reservations', { enable_new_home: false })).toBe(false);
});

test('a mapped flag missing from the response is treated as off', () => {
  expect(isDestinationEnabled('reservations', {})).toBe(false);
});
