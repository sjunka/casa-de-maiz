import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import { useTheme, type Theme } from '../theme/useTheme';
import type { CardGridBlock as CardGridBlockData } from '../models/block';

type Card = CardGridBlockData['cards'][number];
type Props = { block: CardGridBlockData };

const keyExtractor = (_: Card, index: number) => `card-${index}`;

const cardRenderItem =
  (colors: Theme['colors']) =>
  ({ item }: ListRenderItemInfo<Card>) => (
    <View style={styles.card}>
      <CmsImage image={item.image} style={[styles.image, { backgroundColor: colors.imagePlaceholder }]} />
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      {item.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
      ) : null}
      {item.price ? <Text style={[styles.price, { color: colors.text }]}>{item.price}</Text> : null}
    </View>
  );

export const CardGridBlock = ({ block }: Props) => {
  const { colors } = useTheme();
  const renderItem = useMemo(() => cardRenderItem(colors), [colors]);

  return (
    <View>
      {block.eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{block.eyebrow}</Text> : null}
      {block.title ? <Text style={[styles.heading, { color: colors.text }]}>{block.title}</Text> : null}
      <FlatList
        data={block.cards}
        keyExtractor={keyExtractor}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.container}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  eyebrow: { marginHorizontal: 16, marginTop: 16, fontSize: 13, fontWeight: '600' },
  heading: { marginHorizontal: 16, marginTop: 4, fontSize: 20, fontWeight: '700' },
  container: { padding: 16, gap: 16 },
  row: { gap: 16 },
  card: { flex: 1 },
  image: { borderRadius: 8 },
  title: { marginTop: 8, fontSize: 16, fontWeight: '600' },
  description: { marginTop: 4, fontSize: 13 },
  price: { marginTop: 4, fontSize: 14, fontWeight: '600' },
});
