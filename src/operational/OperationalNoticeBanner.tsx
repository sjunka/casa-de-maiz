import { StyleSheet, Text, View } from 'react-native';
import type { OperationalControls } from '../models/operationalControls';

type Props = { operationalControls?: OperationalControls };

export const OperationalNoticeBanner = ({ operationalControls }: Props) => {
  if (!operationalControls || operationalControls.mode !== 'notice' || !operationalControls.bannerMessage) {
    return null;
  }

  return (
    <View style={styles.container} testID="operational-notice-banner">
      <Text style={styles.message}>{operationalControls.bannerMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#e6f0ff' },
  message: { fontSize: 13, textAlign: 'center' },
});
