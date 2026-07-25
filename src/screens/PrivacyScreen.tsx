import { StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { RootTabParamList } from '../navigation/types';

type Props = { route: RouteProp<RootTabParamList, 'privacy'> };

export const PrivacyScreen = ({ route }: Props) => (
  <View style={styles.container}>
    <Text style={styles.title}>Privacy</Text>
    <Text style={styles.subtitle}>Legal document: {route.params.legalKey}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#666' },
});
