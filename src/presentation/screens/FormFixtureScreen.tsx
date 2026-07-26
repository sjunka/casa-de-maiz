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
      submitButtonLabel: 'Send message',
      confirmationMessage: 'Thanks! We received your message.',
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true },
        { blockType: 'email', name: 'email', label: 'Email', required: true },
        { blockType: 'select', name: 'topic', label: 'Topic', required: true, options: [
          { label: 'Reservation', value: 'reservation' },
          { label: 'Feedback', value: 'feedback' },
        ] },
        { blockType: 'textarea', name: 'message', label: 'Message', required: false },
        { blockType: 'checkbox', name: 'subscribe', label: 'Send me updates', required: false },
      ],
    },
  },
];

export const FormFixtureScreen = () => (
  <ScrollView style={styles.fill} contentContainerStyle={styles.fill} testID="form-fixture-screen">
    <BlockList layout={FORM_FIXTURE_LAYOUT} />
  </ScrollView>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
