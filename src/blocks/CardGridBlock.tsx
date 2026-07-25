import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import type { CardGridBlock as CardGridBlockData } from '../models/block';

type Card = CardGridBlockData['cards'][number];
type Props = { block: CardGridBlockData };

const keyExtractor = (_: Card, index: number) => `card-${index}`;

const CardItem = ({ item }: ListRenderItemInfo<Card>) => (
  <View style={styles.card}>
    <CmsImage image={item.image} style={styles.image} />
    <Text style={styles.title}>{item.title}</Text>
    {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
    {item.price ? <Text style={styles.price}>{item.price}</Text> : null}
  </View>
);

export const CardGridBlock = ({ block }: Props) => (
  <View>
    {block.eyebrow ? <Text style={styles.eyebrow}>{block.eyebrow}</Text> : null}
    {block.title ? <Text style={styles.heading}>{block.title}</Text> : null}
    <FlatList
      data={block.cards}
      keyExtractor={keyExtractor}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      renderItem={CardItem}
    />
  </View>
);

const styles = StyleSheet.create({
  eyebrow: { marginHorizontal: 16, marginTop: 16, fontSize: 13, color: '#8a2c1d', fontWeight: '600' },
  heading: { marginHorizontal: 16, marginTop: 4, fontSize: 20, fontWeight: '700' },
  container: { padding: 16, gap: 16 },
  row: { gap: 16 },
  card: { flex: 1 },
  image: { borderRadius: 8, backgroundColor: '#eee' },
  title: { marginTop: 8, fontSize: 16, fontWeight: '600' },
  description: { marginTop: 4, fontSize: 13, color: '#666' },
  price: { marginTop: 4, fontSize: 14, fontWeight: '600' },
});
