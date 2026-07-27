import { StyleSheet, Text, View } from 'react-native';
import { CmsImage } from '../ui/CmsImage';
import { useTheme } from '../theme/useTheme';
import type { ImageBlock as ImageBlockData } from '@core/contract/models/blocks/block';

type Props = { block: ImageBlockData };

export const ImageBlock = ({ block }: Props) => {
  const { colors } = useTheme();

  return (
    <View style={block.fullBleed ? undefined : styles.padded}>
      <CmsImage image={block.image} style={[styles.image, { backgroundColor: colors.imagePlaceholder }]} />
      {block.caption ? <Text style={[styles.caption, { color: colors.textSecondary }]}>{block.caption}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  padded: { padding: 16 },
  image: { width: '100%' },
  caption: { marginTop: 8, fontSize: 13 },
});
