import { ArrowUpRight, Bell, ChevronRight, Flame, Plus, Settings, Sparkles, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Avatar, Button, Card, ProgressBar, ScreenScroll, SectionHeader } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { buildUserLeaderboard, formatNumber, getUserStats } from '@/domain/rules';
import { LeaderboardRows } from '@/features/leaderboards/components';
import { ChallengeCard, MissionCard } from '@/features/missions/components';
import { FeedItem } from '@/features/social/components';
import { AppShell } from '@/navigation/AppShell';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { state } = useRetornaStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;
  const user = state.profiles.find((item) => item.id === state.currentUserId)!;
  const stats = getUserStats(state, state.currentUserId);
  const mission = state.missions.find((item) => item.status === 'active')!;
  const challenge = state.challenges.find((item) => item.communityId === 'com-ingenieria')!;
  const leaderboard = buildUserLeaderboard(state, 'week', 'com-ingenieria');
  const currentRank = leaderboard.find((item) => item.id === state.currentUserId)?.rank ?? 0;
  const levelProgress = ((stats.points - stats.currentLevelFloor) / (stats.nextLevelAt - stats.currentLevelFloor)) * 100;
  return (
    <AppShell>
      <ScreenScroll contentContainerStyle={[styles.screen, wide && styles.screenWide]}>
        <View style={styles.header}>
          <View style={styles.identity}><Avatar initials={user.initials} color={user.avatarColor} size={48} /><View><AppText variant="caption" style={{ color: colors.textMuted }}>Viernes · Campus San Joaquín</AppText><AppText variant="h2">Hola, {user.displayName.split(' ')[0]}</AppText></View></View>
          <View style={styles.headerActions}><Pressable accessibilityLabel="Notificaciones" style={[styles.iconButton, { backgroundColor: colors.surface }]}><Bell size={20} color={colors.text} /><View style={[styles.notificationDot, { backgroundColor: colors.primary }]} /></Pressable><Pressable onPress={() => router.push('/settings')} accessibilityLabel="Configuración" style={[styles.iconButton, { backgroundColor: colors.surface }]}><Settings size={20} color={colors.text} /></Pressable></View>
        </View>

        <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={styles.mainColumn}>
            <Card style={[styles.hero, { backgroundColor: colors.surfaceStrong, borderColor: colors.surfaceStrong }]}>
              <View style={styles.heroTop}><View><AppText variant="eyebrow" style={{ color: colors.environmental }}>Tu semana</AppText><AppText variant="display" style={{ color: colors.textOnStrong }}>{formatNumber(stats.weeklyPoints)} pts</AppText></View><View style={[styles.streak, { backgroundColor: `${colors.primary}24` }]}><Flame size={18} color={colors.primary} fill={colors.primary} /><AppText variant="bodyStrong" style={{ color: colors.textOnStrong }}>{Math.max(4, stats.currentStreak)} días</AppText></View></View>
              <View style={styles.heroStats}><View><AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.62 }}>Ranking Ingeniería</AppText><AppText variant="h2" style={{ color: colors.textOnStrong }}>#{currentRank}</AppText></View><View style={styles.heroDivider} /><View><AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.62 }}>Objetos este mes</AppText><AppText variant="h2" style={{ color: colors.textOnStrong }}>{stats.items}</AppText></View><View style={styles.heroDivider} /><View><AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.62 }}>Impacto estimado</AppText><AppText variant="h2" style={{ color: colors.textOnStrong }}>{stats.estimatedKg} kg</AppText></View></View>
              <View style={styles.level}><View style={styles.progressLabels}><AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.7 }}>Nivel {stats.level} · {stats.levelName}</AppText><AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.7 }}>{stats.nextLevelAt - stats.points} pts para subir</AppText></View><ProgressBar value={levelProgress} color={colors.primary} /></View>
              <Button label="Registrar reciclaje" icon={Plus} onPress={() => router.push('/recycle')} />
            </Card>

            <View style={styles.section}><SectionHeader title="Misión que nos une" actionLabel="Ver detalle" onAction={() => router.push({ pathname: '/mission/[id]', params: { id: mission.id } })} /><MissionCard state={state} mission={mission} /></View>

            {!wide && <View style={styles.section}><SectionHeader title="Desafío activo" /><ChallengeCard state={state} challenge={challenge} /></View>}

            <View style={styles.section}><SectionHeader title="Actividad de tu red" actionLabel="Actualizar" /><Card style={styles.feed}>{state.feed.slice(0, 5).map((event) => <FeedItem key={event.id} event={event} state={state} />)}</Card></View>
          </View>

          <View style={styles.sideColumn}>
            <View style={styles.section}><SectionHeader title="Ingeniería esta semana" actionLabel="Ranking" onAction={() => router.push('/leaderboards')} /><Card style={styles.leaderboard}><View style={styles.rankSummary}><View style={[styles.trophy, { backgroundColor: colors.environmentalSoft }]}><Trophy size={24} color={colors.environmental} /></View><View style={{ flex: 1 }}><AppText variant="caption" style={{ color: colors.textMuted }}>Subiste 2 puestos</AppText><AppText variant="h3">Estás #{currentRank}</AppText></View><ArrowUpRight color={colors.environmental} /></View><LeaderboardRows entries={leaderboard} limit={5} /></Card></View>
            {wide && <View style={styles.section}><SectionHeader title="Desafío activo" /><ChallengeCard state={state} challenge={challenge} /></View>}
            <Pressable onPress={() => router.push('/share-card')} style={({ pressed }) => [styles.sharePrompt, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}>
              <View style={styles.shareIcon}><Sparkles size={22} color={colors.primary} /></View><View style={{ flex: 1 }}><AppText variant="h3" style={{ color: '#FFFFFF' }}>Tu avance merece verse</AppText><AppText variant="caption" style={{ color: '#FFFFFF', opacity: 0.82 }}>Crea una Story con tu ranking semanal.</AppText></View><ChevronRight color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </ScreenScroll>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screen: { maxWidth: 780, width: '100%', alignSelf: 'center', paddingTop: 22 },
  screenWide: { maxWidth: 1230 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', right: 10, top: 9 },
  columns: { gap: spacing.xl },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { flex: 1.35, gap: spacing.xxl, minWidth: 0 },
  sideColumn: { flex: 0.8, gap: spacing.xxl, minWidth: 310 },
  hero: { gap: spacing.xl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streak: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', gap: 7, alignItems: 'center' },
  heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroDivider: { width: 1, height: 38, backgroundColor: 'rgba(255,255,255,.14)' },
  level: { gap: spacing.sm },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  section: { gap: spacing.md },
  feed: { paddingVertical: spacing.sm },
  leaderboard: { padding: spacing.sm },
  rankSummary: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  trophy: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sharePrompt: { minHeight: 105, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  shareIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
