import { ActivityIndicator, Button, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp, type RouteProp } from '@react-navigation/native';
import type { RootTabParamList } from '../navigation/types';
import { resolveDestination } from '../navigation/resolveDestination';
import { useLegalDocument } from '../api/useLegalDocument';
import { RichText } from '../ui/RichText';

type Props = { route: RouteProp<RootTabParamList, 'privacy'> };

export const PrivacyScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const { data, error, isLoading, refetch } = useLegalDocument(route.params.legalKey);

  const handleLinkPress = (href: string) => {
    const resolved = resolveDestination(href);

    if (resolved.kind === 'internal') {
      if (resolved.screen === 'privacy') {
        navigation.navigate('privacy', { legalKey: resolved.legalKey });
        return;
      }
      navigation.navigate(resolved.screen);
      return;
    }

    if (resolved.kind === 'external') {
      Linking.canOpenURL(resolved.url).then(supported => {
        if (supported) {
          Linking.openURL(resolved.url);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center} testID="privacy-loading">
        <ActivityIndicator />
        <Text style={styles.subtitle}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center} testID="privacy-error">
        <Text style={styles.title}>Privacy</Text>
        <Text style={styles.subtitle}>{error.userMessage}</Text>
        <Button title="Try again" onPress={() => refetch()} />
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} testID="privacy-content">
      <Text style={styles.title} selectable accessibilityRole="header">
        {data.data.title}
      </Text>
      {data.data.summary ? (
        <Text style={styles.summary} selectable>
          {data.data.summary}
        </Text>
      ) : null}
      <RichText document={data.data.body} onLinkPress={handleLinkPress} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
  summary: { marginTop: 8, marginBottom: 16, fontSize: 16, color: '#444' },
});
