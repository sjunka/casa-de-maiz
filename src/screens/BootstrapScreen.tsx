import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBootstrap } from '@data/repository/useBootstrap';
import { TabNavigator } from '../navigation/TabNavigator';
import { flattenNavigation } from '@core/contract/models/bootstrap';
import { AlertBanner } from '../presentation/banners/AlertBanner';
import { OperationalNoticeBanner } from '../presentation/banners/OperationalNoticeBanner';
import { AppUpdateGate } from '../presentation/banners/AppUpdateGate';
import { useTheme } from '../theme/useTheme';

type Props = { currentRouteName: string };

export const BootstrapScreen = ({ currentRouteName }: Props) => {
  const { data, error, isLoading, refetch } = useBootstrap();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} testID="bootstrap-loading">
        <ActivityIndicator />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Loading Casa Maiz…</Text>
      </SafeAreaView>
    );
  }

  if (error?.kind === 'unsupported-contract') {
    return (
      <SafeAreaView style={styles.container} testID="bootstrap-unsupported-contract">
        <Text style={[styles.title, { color: colors.text }]}>Casa Maiz</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{error.userMessage}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} testID="bootstrap-error">
        <Text style={[styles.title, { color: colors.text }]}>Casa Maiz</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{error.userMessage}</Text>
        <Button title="Try again" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <View style={styles.fill} testID="bootstrap-success">
      <AppUpdateGate appUpdate={data.data.operationalControls?.appUpdate}>
        <OperationalNoticeBanner operationalControls={data.data.operationalControls} />
        <AlertBanner alerts={data.data.alerts} currentPageSlug={currentRouteName} />
        <TabNavigator destinations={flattenNavigation(data.data.navigation)} flags={data.data.featureFlags} />
      </AppUpdateGate>
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
    textAlign: 'center',
  },
});
