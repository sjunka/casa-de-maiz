import { StyleSheet, Text, View } from 'react-native';
import { useDestinationNavigation } from '../navigation/useDestinationNavigation';
import { useTheme } from '../theme/useTheme';
import { AppPressable } from '../ui/AppPressable';
import type { RestaurantCtaBlock as RestaurantCtaBlockData } from '@core/contract/models/block';

type Props = { block: RestaurantCtaBlockData };

export const RestaurantCtaBlock = ({ block }: Props) => {
  const navigateToDestination = useDestinationNavigation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.headline, { color: colors.text }]}>{block.headline}</Text>
      {block.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{block.description}</Text>
      ) : null}
      <AppPressable
        accessibilityRole="button"
        accessibilityLabel={block.label}
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={() => navigateToDestination(block.href)}
      >
        <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>{block.label}</Text>
      </AppPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  headline: { marginTop: 12, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  description: { marginTop: 4, fontSize: 14, textAlign: 'center' },
  button: {
    marginTop: 16,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
});
