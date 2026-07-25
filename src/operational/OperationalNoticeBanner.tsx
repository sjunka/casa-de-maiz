import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import type { OperationalControls } from '../models/operationalControls';

type Props = { operationalControls?: OperationalControls };

export const OperationalNoticeBanner = ({ operationalControls }: Props) => {
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();

  if (!operationalControls || operationalControls.mode !== 'notice' || !operationalControls.bannerMessage) {
    return null;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.infoBackground, paddingTop: 12 + top }]}
      testID="operational-notice-banner"
    >
      <Text style={[styles.message, { color: colors.infoText }]}>{operationalControls.bannerMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12 },
  message: { fontSize: 13, textAlign: 'center' },
});
