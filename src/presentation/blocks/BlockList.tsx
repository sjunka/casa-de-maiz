import { StyleSheet, View } from 'react-native';
import { renderBlock } from './registry';
import { SourceMarker, type DataSource } from '../ui/SourceMarker';
import type { BlockEnvelope } from '@core/contract/models/block';
import type { BootstrapPromotion } from '@core/contract/models/promotion';

type Props = { layout: BlockEnvelope[]; fallbackPromotions?: BootstrapPromotion[]; source?: DataSource };

export const BlockList = ({ layout, fallbackPromotions, source = 'cms' }: Props) => (
  <View style={styles.container}>
    {layout.map((block, index) => {
      const rendered = renderBlock(block, index, { fallbackPromotions });
      return rendered === null ? null : (
        <SourceMarker key={index} source={source} note={block.blockType}>
          {rendered}
        </SourceMarker>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  // Lets a block that wants to fill the screen (e.g. FormBlock's success
  // state) grow into any leftover space when the parent ScrollView opts in
  // via `contentContainerStyle={{ flexGrow: 1 }}`. A no-op otherwise.
  container: { flex: 1 },
});
