import { StyleSheet, Text, View } from 'react-native';

export const PlaceholderScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Casa Maiz</Text>
      <Text style={styles.subtitle}>CMS-driven experience coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
