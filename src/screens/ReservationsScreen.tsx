import { StyleSheet, Text, View } from 'react-native';

export const ReservationsScreen = () => (
  <View style={styles.container} testID="reservations-placeholder">
    <Text style={styles.title}>Reservations</Text>
    <Text style={styles.subtitle}>
      Reservations aren't bookable in the app yet. Please call the restaurant to book a table.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
});
