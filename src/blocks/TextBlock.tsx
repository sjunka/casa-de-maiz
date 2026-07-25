import { StyleSheet, Text, View } from 'react-native';
import type { TextBlock as TextBlockData } from '../models/block';

type Props = { block: TextBlockData };

export const TextBlock = ({ block }: Props) => (
  <View style={styles.container}>
    {block.heading ? <Text style={styles.heading}>{block.heading}</Text> : null}
    <Text style={styles.body}>{block.body}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22, color: '#333' },
});
