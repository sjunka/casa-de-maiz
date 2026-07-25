import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { RootTabParamList } from '../navigation/types';
import { useDestinationNavigation } from '../navigation/useDestinationNavigation';
import { useLegalDocument } from '../api/useLegalDocument';
import { RichText } from '../ui/RichText';

type Props = { route: RouteProp<RootTabParamList, 'privacy'> };

export const PrivacyScreen = ({ route }: Props) => {
  const navigateTo = useDestinationNavigation();
  const { data, error, isLoading, refetch } = useLegalDocument(route.params.legalKey);

  if (isLoading) {
    return (
      <View style={styles.container} testID="privacy-loading">
        <ActivityIndicator />
        <Text style={styles.subtitle}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container} testID="privacy-error">
        <Text style={styles.title}>Privacy</Text>
        <Text style={styles.subtitle}>{error.userMessage}</Text>
        {error.kind !== 'unsupported-contract' && <Button title="Try again" onPress={() => refetch()} />}
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} testID="privacy-success">
      <Text style={styles.title} selectable accessibilityRole="header">
        {data.data.title}
      </Text>
      {data.data.summary ? (
        <Text style={styles.summary} selectable>
          {data.data.summary}
        </Text>
      ) : null}
      <RichText document={data.data.body} onLinkPress={navigateTo} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
  summary: { marginTop: 8, marginBottom: 16, fontSize: 16, color: '#444' },
});
