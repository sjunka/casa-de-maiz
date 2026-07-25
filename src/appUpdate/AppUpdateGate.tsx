import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getAppVersion } from '../api/appVersion';
import { decideAppUpdate } from './decideAppUpdate';
import type { AppUpdate } from '../models/operationalControls';

type Props = { appUpdate?: AppUpdate; children: ReactNode };

export const AppUpdateGate = ({ appUpdate, children }: Props) => {
  const [dismissed, setDismissed] = useState(false);
  const decision = decideAppUpdate(appUpdate, getAppVersion());

  if (decision.kind === 'required') {
    return (
      <View style={styles.blocking} testID="app-update-required">
        <Text style={styles.title}>Update required</Text>
        <Text style={styles.message}>{decision.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {decision.kind === 'recommended' && !dismissed && (
        <View style={styles.banner} testID="app-update-recommended">
          <Text style={styles.bannerMessage}>{decision.message}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss update message" onPress={() => setDismissed(true)}>
            <Text style={styles.dismiss}>×</Text>
          </Pressable>
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
  message: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff3cd',
  },
  bannerMessage: { flex: 1, fontSize: 13 },
  dismiss: { fontSize: 18, paddingHorizontal: 12 },
});
