import { resolveMediaUrl } from './media';

test('passes an absolute CDN URL through unchanged', () => {
  expect(resolveMediaUrl('https://cdn.example.com/image.jpg')).toBe(
    'https://cdn.example.com/image.jpg',
  );
});

test('resolves a relative Payload path against the configured base URL', () => {
  expect(resolveMediaUrl('/media/image.jpg')).toBe(
    'https://payload-cms-poc-seven.vercel.app/media/image.jpg',
  );
});

test('resolves a relative path missing a leading slash', () => {
  expect(resolveMediaUrl('media/image.jpg')).toBe(
    'https://payload-cms-poc-seven.vercel.app/media/image.jpg',
  );
});
