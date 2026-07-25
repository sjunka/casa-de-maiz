import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMenu } from '../api/useMenu';
import { BlockList } from '../blocks/BlockList';

export const MenuScreen = () => {
  const { data, error, isLoading, refetch } = useMenu();

  if (isLoading) {
    return (
      <View style={styles.container} testID="menu-loading">
        <ActivityIndicator />
        <Text style={styles.subtitle}>Loading menu…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container} testID="menu-error">
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.subtitle}>{error.userMessage}</Text>
        {error.kind !== 'unsupported-contract' && <Button title="Try again" onPress={() => refetch()} />}
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollView style={styles.fill} testID="menu-success">
      <BlockList layout={data.data.layout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  fill: { flex: 1 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
});
