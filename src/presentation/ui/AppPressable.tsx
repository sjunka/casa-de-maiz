import { Platform, Pressable, StyleSheet, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  rippleColor?: string;
};

// Android gets ripple feedback (Material convention); iOS gets opacity
// feedback. One component so every call site changes in one place (ADR 0012).
export const AppPressable = ({ style, rippleColor, ...rest }: Props) => (
  <Pressable
    android_ripple={Platform.OS === 'android' ? { color: rippleColor } : undefined}
    style={state => [typeof style === 'function' ? style(state) : style, Platform.OS === 'ios' && state.pressed && styles.pressed]}
    {...rest}
  />
);

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
});
