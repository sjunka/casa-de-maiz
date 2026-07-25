import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export const ReservationsScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container} testID="reservations-placeholder">
      <Text style={[styles.title, { color: colors.text }]}>Reservations</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Reservations aren't bookable in the app yet. Please call the restaurant to book a table.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, textAlign: 'center' },
});
