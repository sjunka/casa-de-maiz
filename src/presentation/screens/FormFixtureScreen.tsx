import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { BlockList } from '../blocks/BlockList';
import { AppPressable } from '../ui/AppPressable';
import { useReducedMotion } from '../theme/useReducedMotion';
import { useTheme, toggleSchemeOverride } from '../theme/useTheme';
import { MIN_TOUCH_TARGET } from '../theme/tokens';
import type { BlockEnvelope } from '@core/contract/models/block';

// Dev-only: no live page serves a formBlock yet,
// so this fixture is the only way to see and exercise the block.
const FORM_FIXTURE_LAYOUT: BlockEnvelope[] = [
  {
    blockType: 'formBlock',
    contractVersion: '1.1',
    channels: ['ios', 'android'],
    form: {
      id: 'fixture-contact-form',
      submitButtonLabel: 'Enviar mensaje',
      confirmationMessage: '¡Gracias! Recibimos tu mensaje.',
      fields: [
        { blockType: 'text', name: 'name', label: 'Nombre', required: true },
        { blockType: 'email', name: 'email', label: 'Correo electrónico', required: true },
        { blockType: 'select', name: 'topic', label: 'Asunto', required: true, options: [
          { label: 'Reserva', value: 'reservation' },
          { label: 'Comentarios', value: 'feedback' },
        ] },
        { blockType: 'textarea', name: 'message', label: 'Mensaje', required: false },
        { blockType: 'checkbox', name: 'subscribe', label: 'Quiero recibir novedades', required: false },
      ],
    },
  },
];

const WAVE_MS = 520;

// Dev-only: the app follows the system scheme, so this is the only way to see
// dark mode from inside the app. The gear turns a half-step while a single
// ring rides out from under it — one shared value drives both, so the turn and
// the wave stay in step.
const SchemeToggle = () => {
  const { scheme, colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const wave = useSharedValue(0);

  const handlePress = () => {
    if (!reducedMotion) {
      wave.value = 0;
      wave.value = withTiming(1, { duration: WAVE_MS, easing: Easing.out(Easing.cubic) });
    }
    toggleSchemeOverride(scheme);
  };

  const gearStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wave.value * 180}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - wave.value),
    transform: [{ scale: 0.4 + wave.value * 1.1 }],
  }));

  return (
    <AppPressable
      accessibilityRole="switch"
      accessibilityLabel="Toggle dark mode"
      accessibilityState={{ checked: scheme === 'dark' }}
      onPress={handlePress}
      rippleColor={colors.border}
      style={styles.toggle}
      testID="form-fixture-scheme-toggle"
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.wave, { borderColor: colors.accent }, ringStyle]}
      />
      <Animated.View style={gearStyle}>
        <MaterialDesignIcons name="cog-outline" size={24} color={colors.textSecondary} />
      </Animated.View>
    </AppPressable>
  );
};

export const FormFixtureScreen = () => (
  <View style={styles.fill}>
    <ScrollView style={styles.fill} contentContainerStyle={styles.content} testID="form-fixture-screen">
      <BlockList layout={FORM_FIXTURE_LAYOUT} source="mock" />
    </ScrollView>
    <SchemeToggle />
  </View>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1 },
  toggle: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MIN_TOUCH_TARGET / 2,
  },
  wave: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: MIN_TOUCH_TARGET / 2,
    borderWidth: 1.5,
  },
});
