import { StyleSheet, Text, View } from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import type { ImageBlock as ImageBlockData } from '../models/block';

type Props = { block: ImageBlockData };

export const ImageBlock = ({ block }: Props) => (
  <View style={block.fullBleed ? undefined : styles.padded}>
    <CmsImage image={block.image} style={styles.image} />
    {block.caption ? <Text style={styles.caption}>{block.caption}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  padded: { padding: 16 },
  image: { width: '100%', backgroundColor: '#eee' },
  caption: { marginTop: 8, fontSize: 13, color: '#666' },
});
