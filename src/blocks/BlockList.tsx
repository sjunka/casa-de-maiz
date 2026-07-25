import { View } from 'react-native';
import { renderBlock } from './registry';
import type { BlockEnvelope } from '../models/block';
import type { BootstrapPromotion } from '../models/promotion';

type Props = { layout: BlockEnvelope[]; fallbackPromotions?: BootstrapPromotion[] };

export const BlockList = ({ layout, fallbackPromotions }: Props) => (
  <View>{layout.map((block, index) => renderBlock(block, index, { fallbackPromotions }))}</View>
);
