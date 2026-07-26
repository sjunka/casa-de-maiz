import { StyleSheet, View } from 'react-native';
import { FormBlockPrototype } from '../blocks/prototypes/FormBlockPrototype';
import type { FormBlock as FormBlockData } from '@core/contract/models/block';

// Dev-only: no live page serves a formBlock yet (see docs/adr/0011-form-block-modelling.md),
// so this fixture is the only way to see and exercise the block.
//
// Currently mounting the mattpocock-skills:prototype look-and-feel variants
// (src/presentation/blocks/prototypes/) instead of the real FormBlock —
// switch the bar at the top of the screen between them. Once a variant is
// picked, fold it into FormBlock.tsx, delete the prototypes folder, and
// restore the BlockList render below.
const FORM_FIXTURE_BLOCK: FormBlockData = {
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
};

export const FormFixtureScreen = () => (
  <View style={styles.fill} testID="form-fixture-screen">
    <FormBlockPrototype block={FORM_FIXTURE_BLOCK} />
  </View>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
