import { View } from 'react-native';
import { renderBlock } from './registry';
import type { BlockEnvelope } from '../models/block';

type Props = { layout: BlockEnvelope[] };

export const BlockList = ({ layout }: Props) => (
  <View>{layout.map((block, index) => renderBlock(block, index))}</View>
);
