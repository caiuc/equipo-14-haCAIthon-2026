import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/auth/AppAuthProvider';
import { RetornaMark } from '@/design/Logo';
import { useTheme } from '@/design/theme';

export default function Index() {
  const auth = useAppAuth();
  const { colors } = useTheme();
  if (!auth.isLoaded) return <View style={[styles.loading, { backgroundColor: colors.background }]}><RetornaMark size={64} /><ActivityIndicator color={colors.primary} /></View>;
  return <Redirect href={auth.isSignedIn ? '/home' : '/sign-in'} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 } });
