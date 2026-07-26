import { ScrollView, StyleSheet } from 'react-native';
import { BlockList } from '../blocks/BlockList';
import type { BlockEnvelope } from '@core/contract/models/block';

// Dev-only: no live page serves a formBlock yet (see docs/adr/0011-form-block-modelling.md),
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

export const FormFixtureScreen = () => (
  <ScrollView style={styles.fill} contentContainerStyle={styles.content} testID="form-fixture-screen">
    <BlockList layout={FORM_FIXTURE_LAYOUT} />
  </ScrollView>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1 },
});
