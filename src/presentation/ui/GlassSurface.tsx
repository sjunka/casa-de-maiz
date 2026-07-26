import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useReduceTransparency } from '../theme/useReduceTransparency';

type Props = {
  style?: StyleProp<ViewStyle>;
  blurType: 'thinMaterialLight' | 'thinMaterialDark';
  fallbackColor: string;
};

// A genuine UIVisualEffectView material on iOS. Reduce Transparency swaps it
// for an opaque surface, live via a listener rather than only at mount.
// Android has no glass treatment; it gets an opaque surface too.
export const GlassSurface = ({ style, blurType, fallbackColor }: Props) => {
  const reduceTransparency = useReduceTransparency();

  if (Platform.OS !== 'ios' || reduceTransparency) {
    return <View style={[StyleSheet.absoluteFill, style, { backgroundColor: fallbackColor }]} />;
  }

  return (
    <BlurView
      style={[StyleSheet.absoluteFill, style]}
      blurType={blurType}
      blurAmount={20}
      reducedTransparencyFallbackColor={fallbackColor}
    />
  );
};
