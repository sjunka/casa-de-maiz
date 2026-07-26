import { act } from 'react';
import { AccessibilityInfo } from 'react-native';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useReducedMotion } from '@presentation/theme/useReducedMotion';

test('reads the initial reduce-motion preference', async () => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  const addEventListenerSpy = jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() } as never);

  const { result } = await renderHook(() => useReducedMotion());

  await waitFor(() => expect(result.current).toBe(true));

  addEventListenerSpy.mockRestore();
  jest.restoreAllMocks();
});

test('updates when the system setting changes', async () => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  let changeHandler: ((enabled: boolean) => void) | undefined;
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_event, handler) => {
    changeHandler = handler as unknown as (enabled: boolean) => void;
    return { remove: jest.fn() } as never;
  });

  const { result } = await renderHook(() => useReducedMotion());
  await waitFor(() => expect(result.current).toBe(false));

  act(() => changeHandler?.(true));
  await waitFor(() => expect(result.current).toBe(true));

  jest.restoreAllMocks();
});
