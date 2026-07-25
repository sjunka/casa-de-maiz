import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import { useDestinationNavigation } from '../navigation/useDestinationNavigation';
import type { RestaurantCtaBlock as RestaurantCtaBlockData } from '../models/block';

type Props = { block: RestaurantCtaBlockData };

export const RestaurantCtaBlock = ({ block }: Props) => {
  const navigateToDestination = useDestinationNavigation();

  return (
    <View style={styles.container}>
      <CmsImage image={block.image} mobileImage={block.mobileImage} style={styles.image} />
      <Text style={styles.heading}>{block.heading}</Text>
      {block.description ? <Text style={styles.description}>{block.description}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={block.buttonLabel}
        style={styles.button}
        onPress={() => navigateToDestination(block.destination)}
      >
        <Text style={styles.buttonLabel}>{block.buttonLabel}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  image: { width: '100%', borderRadius: 8, backgroundColor: '#eee' },
  heading: { marginTop: 12, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  description: { marginTop: 4, fontSize: 14, color: '#666', textAlign: 'center' },
  button: {
    marginTop: 16,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8a2c1d',
    borderRadius: 8,
  },
  buttonLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
