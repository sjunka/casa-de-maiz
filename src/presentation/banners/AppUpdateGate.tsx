import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAppVersion } from '@core/contract/appVersion';
import { decideAppUpdate } from '@data/logic/decideAppUpdate';
import { useTheme } from '../theme/useTheme';
import { AppPressable } from '../ui/AppPressable';
import type { AppUpdate } from '@core/contract/models/operationalControls';

type Props = { appUpdate?: AppUpdate; children: ReactNode };

export const AppUpdateGate = ({ appUpdate, children }: Props) => {
  const { top } = useSafeAreaInsets();
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
        <View
          style={[styles.banner, { backgroundColor: colors.warningBackground, paddingTop: 12 + top }]}
          testID="app-update-recommended"
        >
          <Text style={[styles.bannerMessage, { color: colors.warningText }]}>{decision.message}</Text>
          <AppPressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss update message"
            style={styles.dismiss}
            onPress={() => setDismissed(true)}
          >
            <Text style={[styles.dismissLabel, { color: colors.warningText }]}>×</Text>
          </AppPressable>
        </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  bannerMessage: { flex: 1, fontSize: 13 },
  dismiss: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  dismissLabel: { fontSize: 18 },
});
