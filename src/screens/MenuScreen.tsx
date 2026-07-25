import { StyleSheet, Text, View } from 'react-native';

export const MenuScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Menu</Text>
    <Text style={styles.subtitle}>Coming soon.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666' },
});
