import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Props = { blockType: string };

export const UnknownBlock = ({ blockType }: Props) => {
  const { colors } = useTheme();

  if (!__DEV__) {
    return null;
  }

  return (
    <View style={[styles.container, { borderColor: colors.errorText }]}>
      <Text style={[styles.text, { color: colors.errorText }]}>Unknown block: {blockType}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { margin: 16, padding: 12, borderWidth: 1, borderRadius: 8 },
  text: { fontWeight: '600' },
});
