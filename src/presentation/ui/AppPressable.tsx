import { Platform, Pressable, StyleSheet, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  rippleColor?: string;
  disableRipple?: boolean;
};

// Android gets ripple feedback (Material convention); iOS gets opacity
// feedback. One component so every call site changes in one place (ADR 0012).
// `disableRipple` opts a call site out of the ripple where it fights an
// existing indicator (e.g. the tab bar's own focus line).
export const AppPressable = ({ style, rippleColor, disableRipple, ...rest }: Props) => (
  <Pressable
    android_ripple={Platform.OS === 'android' && !disableRipple ? { color: rippleColor } : undefined}
    style={state => [typeof style === 'function' ? style(state) : style, Platform.OS === 'ios' && state.pressed && styles.pressed]}
    {...rest}
  />
);

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
});
