import { resolveImageSource, resolveMediaUrl } from './media';
import type { MediaAsset } from '../models/media';

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

const asset = (overrides: Partial<MediaAsset> = {}): MediaAsset => ({
  url: '/media/base.jpg',
  width: 1600,
  height: 900,
  alt: 'A plate of tamales',
  ...overrides,
});

test('prefers the mobile image over the base image when both are offered', () => {
  const result = resolveImageSource(
    { image: asset({ url: '/media/desktop.jpg' }), mobileImage: asset({ url: '/media/mobile.jpg' }) },
    320,
    2,
  );

  expect(result?.uri).toBe('https://payload-cms-poc-seven.vercel.app/media/mobile.jpg');
});

test('selects the smallest published size that still covers the container at the device pixel ratio', () => {
  const result = resolveImageSource(
    {
      image: asset({
        sizes: {
          small: { url: '/media/small.jpg', width: 400, height: 225 },
          medium: { url: '/media/medium.jpg', width: 800, height: 450 },
          large: { url: '/media/large.jpg', width: 1600, height: 900 },
        },
      }),
    },
    300,
    2,
  );

  expect(result?.uri).toBe('https://payload-cms-poc-seven.vercel.app/media/medium.jpg');
});

test('falls back to the largest published size when none cover the requested width', () => {
  const result = resolveImageSource(
    {
      image: asset({
        sizes: { small: { url: '/media/small.jpg', width: 200, height: 113 } },
      }),
    },
    1000,
    3,
  );

  expect(result?.uri).toBe('https://payload-cms-poc-seven.vercel.app/media/small.jpg');
});

test('falls back to the base URL when no sizes are published', () => {
  const result = resolveImageSource({ image: asset({ sizes: undefined }) }, 320, 2);

  expect(result?.uri).toBe('https://payload-cms-poc-seven.vercel.app/media/base.jpg');
});

test('derives an aspect ratio from the declared dimensions', () => {
  const result = resolveImageSource({ image: asset({ width: 1600, height: 800 }) }, 320, 2);

  expect(result?.aspectRatio).toBe(2);
});

test('exposes the alternative text the CMS provides', () => {
  const result = resolveImageSource({ image: asset({ alt: 'Tamales on a plate' }) }, 320, 2);

  expect(result?.alt).toBe('Tamales on a plate');
});

test('returns null when neither image nor mobileImage is offered', () => {
  expect(resolveImageSource({}, 320, 2)).toBeNull();
});
