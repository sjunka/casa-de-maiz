import { StyleSheet, View } from 'react-native';
import { renderBlock } from './registry';
import type { BlockEnvelope } from '@core/contract/models/block';
import type { BootstrapPromotion } from '@core/contract/models/promotion';

type Props = { layout: BlockEnvelope[]; fallbackPromotions?: BootstrapPromotion[] };

export const BlockList = ({ layout, fallbackPromotions }: Props) => (
  <View style={styles.container}>{layout.map((block, index) => renderBlock(block, index, { fallbackPromotions }))}</View>
);

const styles = StyleSheet.create({
  // Lets a block that wants to fill the screen (e.g. FormBlock's success
  // state) grow into any leftover space when the parent ScrollView opts in
  // via `contentContainerStyle={{ flexGrow: 1 }}`. A no-op otherwise.
  container: { flex: 1 },
});
