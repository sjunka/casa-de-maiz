import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppPressable } from '../ui/AppPressable';
import { CollapsibleBanner } from '../ui/CollapsibleBanner';
import { useTheme } from '../theme/useTheme';
import type { OperationalControls } from '@core/contract/models/operationalControls';

type Props = { operationalControls?: OperationalControls };

export const OperationalNoticeBanner = ({ operationalControls }: Props) => {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const hasNotice = operationalControls?.mode === 'notice' && !!operationalControls.bannerMessage;

  if (!hasNotice || collapsed) {
    return null;
  }

  return (
    <CollapsibleBanner visible={!dismissed} onExited={() => setCollapsed(true)}>
      <View style={[styles.banner, { backgroundColor: colors.infoBackground }]} testID="operational-notice-banner">
        <Text style={[styles.message, { color: colors.infoText }]}>{operationalControls?.bannerMessage}</Text>
        <AppPressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss notice"
          style={styles.dismiss}
          onPress={() => setDismissed(true)}
        >
          <Text style={[styles.dismissLabel, { color: colors.infoText }]}>×</Text>
        </AppPressable>
      </View>
    </CollapsibleBanner>
  );
};

const styles = StyleSheet.create({
  // Full-bleed slab, same shape as the update banner above it: the stack of
  // notices reads as one piece of chrome instead of three different objects.
  banner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingLeft: 16, paddingRight: 4 },
  message: { flex: 1, fontSize: 13, lineHeight: 18 },
  dismiss: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  dismissLabel: { fontSize: 26, lineHeight: 30 },
});
