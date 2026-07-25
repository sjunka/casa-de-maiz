import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { useBootstrap } from '../api/useBootstrap';
import { TabNavigator } from '../navigation/TabNavigator';
import { flattenNavigation } from '../models/bootstrap';

export const BootstrapScreen = () => {
  const { data, error, isLoading, refetch } = useBootstrap();

  if (isLoading) {
    return (
      <View style={styles.container} testID="bootstrap-loading">
        <ActivityIndicator />
        <Text style={styles.subtitle}>Loading Casa Maiz…</Text>
      </View>
    );
  }

  if (error?.kind === 'unsupported-contract') {
    return (
      <View style={styles.container} testID="bootstrap-unsupported-contract">
        <Text style={styles.title}>Casa Maiz</Text>
        <Text style={styles.subtitle}>{error.userMessage}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container} testID="bootstrap-error">
        <Text style={styles.title}>Casa Maiz</Text>
        <Text style={styles.subtitle}>{error.userMessage}</Text>
        <Button title="Try again" onPress={() => refetch()} />
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <View style={styles.fill} testID="bootstrap-success">
      <TabNavigator destinations={flattenNavigation(data.data.navigation)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fill: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
