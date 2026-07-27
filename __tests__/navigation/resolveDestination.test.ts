import { resolveDestination } from '@navigation/destinations/resolveDestination';

test('resolves the four known internal paths', () => {
  expect(resolveDestination('/')).toEqual({ kind: 'internal', screen: 'home' });
  expect(resolveDestination('/menu')).toEqual({ kind: 'internal', screen: 'menu' });
  expect(resolveDestination('/legal/privacy')).toEqual({
    kind: 'internal',
    screen: 'privacy',
    legalKey: 'privacy',
  });
  expect(resolveDestination('/reservas')).toEqual({ kind: 'internal', screen: 'reservations' });
});

test('accepts an https external URL', () => {
  expect(resolveDestination('https://casamaiz.example/promo')).toEqual({
    kind: 'external',
    url: 'https://casamaiz.example/promo',
  });
});

test('refuses a non-https scheme', () => {
  expect(resolveDestination('http://casamaiz.example')).toEqual({ kind: 'unsupported' });
  expect(resolveDestination('tel:5551234567')).toEqual({ kind: 'unsupported' });
});

test('an unrecognised internal path is unsupported', () => {
  expect(resolveDestination('/catering')).toEqual({ kind: 'unsupported' });
});
