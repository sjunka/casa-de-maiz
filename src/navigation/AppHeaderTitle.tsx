import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@presentation/theme/useTheme';

type Props = { title: string };

// Custom title so alignment matches on both platforms — Android's native
// header defaults the title left, iOS centers it.
export const AppHeaderTitle = ({ title }: Props) => {
  const { colors } = useTheme();
  return <Text style={[styles.title, { color: colors.text }]}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
