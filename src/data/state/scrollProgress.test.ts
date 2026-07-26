import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { resetScrollProgress, scrollPercentOf } from './scrollProgress';

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
