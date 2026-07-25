import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import type { ApiError } from '../api/apiError';

type Props = {
  title: string;
  loadingLabel: string;
  emptyLabel: string;
  isLoading: boolean;
  error: ApiError | null;
  isEmpty: boolean;
  onRetry: () => void;
};

const testIdFor = (kind: ApiError['kind']): string => {
  if (kind === 'not-found') return 'content-not-found';
  if (kind === 'unsupported-contract') return 'content-unsupported-contract';
  return 'content-error';
};

export const ContentStatus = ({ title, loadingLabel, emptyLabel, isLoading, error, isEmpty, onRetry }: Props) => {
  if (isLoading) {
    return (
      <View style={styles.container} testID="content-loading">
        <ActivityIndicator />
        <Text style={styles.subtitle}>{loadingLabel}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container} testID={testIdFor(error.kind)}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{error.userMessage}</Text>
        {error.kind !== 'unsupported-contract' && <Button title="Try again" onPress={onRetry} />}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.container} testID="content-empty">
        <Text style={styles.subtitle}>{emptyLabel}</Text>
      </View>
    );
  }

  return null;
};

export const SavedContentBanner = () => (
  <View style={styles.banner} testID="content-saved-banner">
    <Text style={styles.bannerText}>Showing saved content. Pull to refresh.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
  banner: { padding: 8, backgroundColor: '#fff3cd' },
  bannerText: { fontSize: 12, color: '#664d03', textAlign: 'center' },
});
