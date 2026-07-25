import { StyleSheet, Text, View } from 'react-native';

type Props = { blockType: string };

export const UnknownBlock = ({ blockType }: Props) => {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Unknown block: {blockType}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { margin: 16, padding: 12, borderWidth: 1, borderColor: '#c00', borderRadius: 8 },
  text: { color: '#c00', fontWeight: '600' },
});
