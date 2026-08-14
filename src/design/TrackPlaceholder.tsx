import { ArrowLeft, Construction, ListChecks } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppShell } from '@/navigation/AppShell';
import { AppText, Button, Card, Pill, ScreenScroll } from './components';
import { useTheme } from './theme';
import { spacing } from './tokens';

export function TrackPlaceholder({ title, taskId, description }: { title: string; taskId: string; description: string }) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <AppShell>
      <ScreenScroll contentContainerStyle={styles.screen}>
        <Card style={styles.card}>
          <View style={styles.icon}><Construction color={colors.environmental} size={36} /></View>
          <Pill label={`${taskId} · Track pendiente`} tone="primary" />
          <AppText variant="h1" style={{ textAlign: 'center' }}>{title}</AppText>
          <AppText style={{ color: colors.textMuted, textAlign: 'center', maxWidth: 520 }}>{description}</AppText>
          <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}><ListChecks size={18} color={colors.textMuted} /><AppText variant="caption" style={{ color: colors.textMuted, flex: 1 }}>El alcance, las dependencias y la aceptación están definidos en docs/TASKS.md.</AppText></View>
          <Button label="Volver" icon={ArrowLeft} variant="secondary" onPress={() => router.back()} />
        </Card>
      </ScreenScroll>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', justifyContent: 'center' },
  card: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xxxl },
  icon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  notice: { width: '100%', padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
});
