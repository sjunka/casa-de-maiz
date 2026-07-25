import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import type { TextBlock as TextBlockData } from '../models/block';

type Props = { block: TextBlockData };

export const TextBlock = ({ block }: Props) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { alignItems: alignmentToItems(block.alignment) }]}>
      {block.eyebrow ? (
        <Text style={[styles.eyebrow, { color: colors.accent, textAlign: block.alignment ?? 'left' }]}>
          {block.eyebrow}
        </Text>
      ) : null}
      {block.heading ? (
        <Text style={[styles.heading, { color: colors.text, textAlign: block.alignment ?? 'left' }]}>
          {block.heading}
        </Text>
      ) : null}
      <Text style={[styles.body, { color: colors.text, textAlign: block.alignment ?? 'left' }]}>{block.body}</Text>
    </View>
  );
};

const alignmentToItems = (alignment: TextBlockData['alignment']) => {
  if (alignment === 'center') return 'center';
  if (alignment === 'right') return 'flex-end';
  return 'flex-start';
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  eyebrow: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22 },
});
