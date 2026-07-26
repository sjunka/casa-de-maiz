import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import { Surface } from '../ui/Surface';
import { useTheme, type Theme } from '../theme/useTheme';
import type { PromoRailBlock as PromoRailBlockData } from '@core/contract/models/block';
import type { BootstrapPromotion } from '@core/contract/models/promotion';

type Promotion = PromoRailBlockData['promotions'][number];
type Props = { block: PromoRailBlockData; fallbackPromotions?: BootstrapPromotion[] };

const keyExtractor = (_: Promotion, index: number) => `promo-${index}`;

const promotionRenderItem =
  (colors: Theme['colors']) =>
  ({ item }: ListRenderItemInfo<Promotion>) => (
    <Surface style={styles.card}>
      <CmsImage
        image={item.desktopImage}
        mobileImage={item.mobileImage}
        style={[styles.image, { backgroundColor: colors.imagePlaceholder }]}
      />
      {item.eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{item.eyebrow}</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      {item.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
      ) : null}
    </Surface>
  );

export const PromoRailBlock = ({ block, fallbackPromotions = [] }: Props) => {
  const { colors } = useTheme();
  const renderItem = useMemo(() => promotionRenderItem(colors), [colors]);

  return (
    <View>
      {block.title ? <Text style={[styles.heading, { color: colors.text }]}>{block.title}</Text> : null}
      <FlatList
        data={block.promotions.length > 0 ? block.promotions : fallbackPromotions}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: { marginHorizontal: 16, marginTop: 16, fontSize: 20, fontWeight: '700' },
  container: { padding: 16, gap: 12 },
  card: { width: 220 },
  image: { borderRadius: 8 },
  eyebrow: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  title: { marginTop: 2, fontSize: 15, fontWeight: '600' },
  description: { marginTop: 4, fontSize: 13 },
});
