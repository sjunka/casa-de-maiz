import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { SourceTag } from '../prototype/DataSourceRibbon.prototype';

export const ReservationsScreen = () => {
  const { colors } = useTheme();

  return (
    <SourceTag source="mock" note="placeholder copy" fill>
      <View style={styles.container} testID="reservations-placeholder">
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Todavía no puedes reservar desde la app. Llama al restaurante para apartar tu mesa.
        </Text>
      </View>
    </SourceTag>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  subtitle: { fontSize: 14, textAlign: 'center' },
});
