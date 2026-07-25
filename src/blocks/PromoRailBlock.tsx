import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import type { PromoRailBlock as PromoRailBlockData } from '../models/block';

type Promotion = PromoRailBlockData['promotions'][number];
type Props = { block: PromoRailBlockData };

const keyExtractor = (_: Promotion, index: number) => `promo-${index}`;

const PromotionItem = ({ item }: ListRenderItemInfo<Promotion>) => (
  <View style={styles.card}>
    <CmsImage image={item.desktopImage} mobileImage={item.mobileImage} style={styles.image} />
    {item.eyebrow ? <Text style={styles.eyebrow}>{item.eyebrow}</Text> : null}
    <Text style={styles.title}>{item.title}</Text>
    {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
  </View>
);

export const PromoRailBlock = ({ block }: Props) => (
  <View>
    {block.title ? <Text style={styles.heading}>{block.title}</Text> : null}
    <FlatList
      data={block.promotions}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      renderItem={PromotionItem}
    />
  </View>
);

const styles = StyleSheet.create({
  heading: { marginHorizontal: 16, marginTop: 16, fontSize: 20, fontWeight: '700' },
  container: { padding: 16, gap: 12 },
  card: { width: 220 },
  image: { borderRadius: 8, backgroundColor: '#eee' },
  eyebrow: { marginTop: 8, fontSize: 12, color: '#8a2c1d', fontWeight: '600' },
  title: { marginTop: 2, fontSize: 15, fontWeight: '600' },
  description: { marginTop: 4, fontSize: 13, color: '#666' },
});
