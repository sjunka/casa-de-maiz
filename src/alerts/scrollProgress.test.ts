import { act, renderHook } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { resetScrollProgress, scrollPercentOf, trackScrollProgress, useScrollProgress } from './scrollProgress';

const scrollEvent = (offsetY: number, contentHeight = 2000, viewportHeight = 1000) =>
  ({
    nativeEvent: {
      contentOffset: { x: 0, y: offsetY },
      contentSize: { width: 400, height: contentHeight },
      layoutMeasurement: { width: 400, height: viewportHeight },
    },
  }) as NativeSyntheticEvent<NativeScrollEvent>;

beforeEach(() => resetScrollProgress());

test('scroll percent is derived from offset over scrollable height', () => {
  expect(scrollPercentOf(scrollEvent(0))).toBe(0);
  expect(scrollPercentOf(scrollEvent(500))).toBe(50);
  expect(scrollPercentOf(scrollEvent(1000))).toBe(100);
});

test('content shorter than the viewport is never partially scrolled', () => {
  expect(scrollPercentOf(scrollEvent(0, 500, 1000))).toBe(0);
});

test('overscroll is clamped to the 0-100 range', () => {
  expect(scrollPercentOf(scrollEvent(-200))).toBe(0);
  expect(scrollPercentOf(scrollEvent(1400))).toBe(100);
});

test('a subscriber sees the percent published by its own owner', async () => {
  const { result } = await renderHook(() => useScrollProgress('home'));
  expect(result.current).toBe(0);

  await act(async () => trackScrollProgress('home')(scrollEvent(600)));
  expect(result.current).toBe(60);
});

test('percent reached on one page does not leak into another', async () => {
  const { result } = await renderHook(() => useScrollProgress('menu'));

  await act(async () => trackScrollProgress('home')(scrollEvent(800)));
  expect(result.current).toBe(0);
});

test('scrolling back up does not un-arm a threshold already reached', async () => {
  const { result } = await renderHook(() => useScrollProgress('home'));

  await act(async () => trackScrollProgress('home')(scrollEvent(800)));
  await act(async () => trackScrollProgress('home')(scrollEvent(0)));
  expect(result.current).toBe(80);
});

test('switching owners restarts the progress the new owner sees', async () => {
  const { result } = await renderHook(() => useScrollProgress('menu'));

  await act(async () => trackScrollProgress('home')(scrollEvent(800)));
  await act(async () => trackScrollProgress('menu')(scrollEvent(200)));
  expect(result.current).toBe(20);
});
