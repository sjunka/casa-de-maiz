import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAppVersion } from '@core/contract/appVersion';
import { decideAppUpdate } from '@data/logic/decideAppUpdate';
import { useTheme } from '../theme/useTheme';
import { NoticeCard } from './NoticeCard';
import type { AppUpdate } from '@core/contract/models/operationalControls';

type Props = { appUpdate?: AppUpdate; children: ReactNode };

export const AppUpdateGate = ({ appUpdate, children }: Props) => {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const decision = decideAppUpdate(appUpdate, getAppVersion());

  if (decision.kind === 'required') {
    return (
      <SafeAreaView style={styles.blocking} testID="app-update-required">
        <Text style={[styles.title, { color: colors.text }]}>Update required</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{decision.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fill}>
      {decision.kind === 'recommended' && !dismissed && (
        <NoticeCard
          testID="app-update-recommended"
          icon="update"
          tint={colors.warningBackground}
          accent={colors.warningText}
          message={decision.message}
          dismissible
          dismissLabel="Dismiss update message"
          onDismiss={() => setDismissed(true)}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blocking: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  message: { marginTop: 8, fontSize: 14, textAlign: 'center' },
});
