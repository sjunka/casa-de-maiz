import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useReducedMotion } from '../theme/useReducedMotion';
import {
  BANNER_COLLAPSE_MS as COLLAPSE_MS,
  BANNER_FADE_MS as FADE_MS,
  BANNER_RISE_DELAY_MS as RISE_DELAY,
  BANNER_RISE_MS as RISE_MS,
} from '../theme/motion';

type Props = { visible: boolean; onExited?: () => void; children: ReactNode };

// Wraps a top banner so it never snaps the screen down or up: the wrapper owns
// an animated height that grows from 0 on mount and collapses back to 0 on
// dismissal, so everything below it slides instead of jumping.
export const CollapsibleBanner = ({ visible, onExited, children }: Props) => {
  const [contentHeight, setContentHeight] = useState(0);
  const fade = useSharedValue(0);
  const lift = useSharedValue(1);
  const collapse = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Entering waits for the first layout pass, otherwise it would grow from 0
    // to 0. Leaving never waits: the dismissal must always resolve.
    if (!contentHeight && visible) return;

    const scale = reducedMotion ? 0 : 1;

    if (visible) {
      collapse.value = withTiming(1, { duration: COLLAPSE_MS * scale, easing: Easing.out(Easing.cubic) });
      lift.value = withDelay(
        COLLAPSE_MS * 0.4 * scale,
        withTiming(0, { duration: RISE_MS * scale, easing: Easing.out(Easing.cubic) }),
      );
      fade.value = withDelay(COLLAPSE_MS * 0.4 * scale, withTiming(1, { duration: FADE_MS * scale }));
      return;
    }

    fade.value = withTiming(0, { duration: FADE_MS * scale });
    lift.value = withDelay(
      RISE_DELAY * scale,
      withTiming(1, { duration: RISE_MS * scale, easing: Easing.in(Easing.cubic) }),
    );
    collapse.value = withDelay(
      (RISE_DELAY + RISE_MS * 0.4) * scale,
      withTiming(0, { duration: COLLAPSE_MS * scale, easing: Easing.inOut(Easing.cubic) }, finished => {
        if (finished && onExited) scheduleOnRN(onExited);
      }),
    );
  }, [visible, contentHeight, reducedMotion, fade, lift, collapse, onExited]);

  const slotStyle = useAnimatedStyle(() => ({ height: collapse.value * contentHeight }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: -34 * lift.value }, { scale: 1 - 0.07 * lift.value }],
  }));

  return (
    // The wrapper owns the height the layout sees; the content sits out of
    // flow inside it so it always measures itself at full size, however far
    // the wrapper has collapsed.
    <Animated.View style={[styles.clip, slotStyle]}>
      <Animated.View
        style={[styles.content, contentStyle]}
        onLayout={event => setContentHeight(event.nativeEvent.layout.height)}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  content: { position: 'absolute', top: 0, left: 0, right: 0 },
});
