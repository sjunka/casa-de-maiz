import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '../theme/useReducedMotion';

// Enter is unhurried so the banner reads as arriving; exit is quicker so the
// space it gives back to the content feels immediate (ADR 0012 motion notes).
const ENTER_MS = 260;
const EXIT_MS = 160;

type Props = { visible: boolean; onExited?: () => void; children: ReactNode };

// Wraps a top banner so it never snaps the screen down or up: the wrapper owns
// an animated height that grows from 0 on mount and collapses back to 0 on
// dismissal, so everything below it slides instead of jumping.
export const CollapsibleBanner = ({ visible, onExited, children }: Props) => {
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Entering waits for the first layout pass, otherwise it would grow from 0
    // to 0. Leaving never waits: the dismissal must always resolve.
    if (!contentHeight && visible) return;

    progress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: reducedMotion ? 0 : visible ? ENTER_MS : EXIT_MS,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      },
      finished => {
        if (finished && !visible && onExited) runOnJS(onExited)();
      },
    );
  }, [visible, contentHeight, reducedMotion, progress, onExited]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight,
    opacity: progress.value,
    transform: [{ translateY: (progress.value - 1) * 8 }],
  }));

  return (
    // The wrapper owns the height the layout sees; the content sits out of
    // flow inside it so it always measures itself at full size, however far
    // the wrapper has collapsed.
    <Animated.View style={[styles.clip, animatedStyle]}>
      <View style={styles.content} onLayout={event => setContentHeight(event.nativeEvent.layout.height)}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  content: { position: 'absolute', top: 0, left: 0, right: 0 },
});
