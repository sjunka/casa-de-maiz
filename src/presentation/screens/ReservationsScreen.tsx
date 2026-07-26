import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export const ReservationsScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container} testID="reservations-placeholder">
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Todavía no puedes reservar desde la app. Llama al restaurante para apartar tu mesa.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  subtitle: { fontSize: 14, textAlign: 'center' },
});
