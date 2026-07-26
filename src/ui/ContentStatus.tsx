import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import type { ApiError } from '@core/transport/apiError';

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
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.container} testID="content-loading">
        <ActivityIndicator />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{loadingLabel}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container} testID={testIdFor(error.kind)}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{error.userMessage}</Text>
        {error.kind !== 'unsupported-contract' && <Button title="Try again" onPress={onRetry} />}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.container} testID="content-empty">
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{emptyLabel}</Text>
      </View>
    );
  }

  return null;
};

export const SavedContentBanner = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: colors.warningBackground }]} testID="content-saved-banner">
      <Text style={[styles.bannerText, { color: colors.warningText }]}>Showing saved content. Pull to refresh.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, textAlign: 'center' },
  banner: { padding: 8 },
  bannerText: { fontSize: 12, textAlign: 'center' },
});
