import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { useBootstrap } from '../api/useBootstrap';
import { TabNavigator } from '../navigation/TabNavigator';
import { flattenNavigation } from '../models/bootstrap';
import { AlertBanner } from '../alerts/AlertBanner';
import { OperationalNoticeBanner } from '../operational/OperationalNoticeBanner';
import { AppUpdateGate } from '../appUpdate/AppUpdateGate';

type Props = { currentRouteName: string };

export const BootstrapScreen = ({ currentRouteName }: Props) => {
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
    color: '#666',
    textAlign: 'center',
  },
});
