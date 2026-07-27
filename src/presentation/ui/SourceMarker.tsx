import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '../theme/useReducedMotion';
import { SOURCE_MARKER_FADE_MS as FADE_MS, SOURCE_MARKER_HOLD_MS as HOLD_MS } from '../theme/motion';

export type DataSource = 'cms' | 'mock';

const CMS_COLOR = '#1d4ed8';
const MOCK_COLOR = '#b45309';

const label = (source: DataSource) => (source === 'cms' ? 'CMS' : 'MOCK');
const color = (source: DataSource) => (source === 'cms' ? CMS_COLOR : MOCK_COLOR);

type Props = {
  source: DataSource;
  note?: string;
  /** Wrapped child fills its parent (a whole screen) rather than hugging content. */
  fill?: boolean;
  children: ReactNode;
};

// Dev-only overlay naming where a rendered surface's content came from. An
// absolutely positioned sibling, never a container: it must not change the
// layout of what it's marking.
export const SourceMarker = ({ source, note, fill, children }: Props) => {
  // Plenty of wrapped children render nothing (a notice with no content, a
  // block filtered out by platform or contract version). Measure first, mark
  // only what's actually on screen.
  const [rendered, setRendered] = useState(false);
  const measure = ({ nativeEvent }: LayoutChangeEvent) => setRendered(nativeEvent.layout.height > 8);

  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(HOLD_MS, withTiming(0, { duration: reducedMotion ? 0 : FADE_MS }));
  }, [opacity, reducedMotion]);

  const markerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!__DEV__) {
    return <>{children}</>;
  }

  return (
    <View style={fill && styles.fill} onLayout={measure} testID="source-marker">
      {children}
      {rendered && (
        <Animated.View pointerEvents="none" style={[styles.marker, { borderColor: color(source) }, markerStyle]}>
          <View style={[styles.pill, { backgroundColor: color(source) }]}>
            <Text style={styles.pillText}>
              {label(source)}
              {note ? ` · ${note}` : ''}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  marker: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  // Inside the frame, not straddling it: a block flush against the top of the
  // screen or of a scroll view has its overflow clipped, and the pill with it.
  pill: {
    position: 'absolute',
    top: 3,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
});
