// PROTOTYPE — throwaway. Question: "how should we mark which UI is fed by the
// backend CMS and which is mocked by us?"
//
// Answer, after trying three markers on the real screens: framed + pill. A
// dashed outline around the component plus a pill naming the source. It reads
// on the first glance and it's the only variant with room for the block type.
//
// The marker is a full-bleed overlay — no border, margin or padding on the
// component itself — so it costs the layout nothing, and it fades out after
// five seconds, leaving the app exactly as it ships. Reload to see it again.
//
// Not production code: no tests, no a11y.
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '../theme/useReducedMotion';

export type DataSource = 'cms' | 'mock';

const CMS_COLOR = '#1d4ed8';
const MOCK_COLOR = '#b45309';

const HOLD_MS = 5_000;
const FADE_MS = 300;

const label = (source: DataSource) => (source === 'cms' ? 'CMS' : 'MOCK');
const color = (source: DataSource) => (source === 'cms' ? CMS_COLOR : MOCK_COLOR);

/** Wrap anything whose data provenance you want to see. */
export const SourceTag = ({
  source,
  note,
  fill,
  children,
}: {
  source: DataSource;
  note?: string;
  /** Wrapped child fills its parent (a whole screen) rather than hugging content. */
  fill?: boolean;
  children: ReactNode;
}) => {
  // Plenty of wrapped children render nothing (a notice with no content, a
  // block filtered out by platform). Measure first, mark only what's on screen.
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
    <View style={fill && styles.fill} onLayout={measure}>
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
  // screen or of a scroll view gets its overflow clipped, and the pill with it.
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
