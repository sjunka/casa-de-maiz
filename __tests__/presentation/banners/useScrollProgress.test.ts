import { act, renderHook } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { resetScrollProgress, trackScrollProgress } from '@data/logic/scrollProgress';
import { useScrollProgress } from '@presentation/banners/useScrollProgress';

const scrollEvent = (offsetY: number, contentHeight = 2000, viewportHeight = 1000) =>
  ({
    nativeEvent: {
      contentOffset: { x: 0, y: offsetY },
      contentSize: { width: 400, height: contentHeight },
      layoutMeasurement: { width: 400, height: viewportHeight },
    },
  }) as NativeSyntheticEvent<NativeScrollEvent>;

beforeEach(() => resetScrollProgress());

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
