import { ArrowUpRight, Flame, Recycle, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Avatar, Card, ProgressBar, ScreenScroll, SectionHeader } from '@/design/components';
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
  const user = state.profiles.find((item) => item.id === state.currentUserId)!;
  const stats = getUserStats(state, state.currentUserId);
  const mission = state.missions.find((item) => item.status === 'active')!;
  const challenge = state.challenges.find((item) => item.communityId === 'com-ingenieria')!;
  const leaderboard = buildUserLeaderboard(state, 'week', 'com-ingenieria');
  const currentRank = leaderboard.find((item) => item.id === state.currentUserId)?.rank ?? 0;
  const levelProgress = ((stats.points - stats.currentLevelFloor) / (stats.nextLevelAt - stats.currentLevelFloor)) * 100;
  return (
    <AppShell>
      <ScreenScroll contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <View style={styles.identity}><Avatar initials={user.initials} color={user.avatarColor} size={48} /><View><AppText variant="caption" style={{ color: colors.textMuted }}>{user.campus ?? 'Tu espacio en Retorna'}</AppText><AppText variant="h2">Hola, {user.displayName.split(' ')[0]}</AppText></View></View>
        </View>

        <Pressable onPress={() => router.push('/recycle')} accessibilityRole="button" accessibilityLabel="Registrar reciclaje" style={({ pressed }) => [styles.recycleCta, { backgroundColor: colors.primary, borderColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}>
          <Recycle size={66} color="#000000" strokeWidth={1.8} />
          <AppText style={styles.recycleTitle}>Registrar reciclaje</AppText>
          <AppText style={styles.recycleDetail}>Escanea o ingresa manualmente lo que reciclaste.</AppText>
        </Pressable>

        <Card style={[styles.hero, { backgroundColor: colors.surfaceStrong, borderColor: colors.primary }]}>
          <View style={styles.heroTop}><View><AppText variant="eyebrow" style={{ color: colors.primary }}>Tu semana</AppText><AppText variant="display" style={{ color: colors.textOnStrong }}>{formatNumber(stats.weeklyPoints)} pts</AppText></View><View style={[styles.streak, { borderColor: colors.primary }]}><Flame size={18} color={colors.primary} fill={colors.primary} /><AppText variant="bodyStrong" style={{ color: colors.textOnStrong }}>{stats.currentStreak} días</AppText></View></View>
          <View style={styles.heroStats}><View><AppText variant="caption" style={{ color: colors.textOnStrong }}>Ranking Ingeniería</AppText><AppText variant="h2" style={{ color: colors.textOnStrong }}>#{currentRank}</AppText></View><View style={styles.heroDivider} /><View><AppText variant="caption" style={{ color: colors.textOnStrong }}>Objetos este mes</AppText><AppText variant="h2" style={{ color: colors.textOnStrong }}>{stats.items}</AppText></View><View style={styles.heroDivider} /><View><AppText variant="caption" style={{ color: colors.textOnStrong }}>Impacto estimado</AppText><AppText variant="h2" style={{ color: colors.textOnStrong }}>{stats.estimatedKg} kg</AppText></View></View>
          <View style={styles.level}><View style={styles.progressLabels}><AppText variant="caption" style={{ color: colors.textOnStrong }}>Nivel {stats.level} · {stats.levelName}</AppText><AppText variant="caption" style={{ color: colors.textOnStrong }}>{stats.nextLevelAt - stats.points} pts para subir</AppText></View><ProgressBar value={levelProgress} color={colors.primary} /></View>
        </Card>

        <View style={styles.section}><SectionHeader title="Misión que nos une" actionLabel="Ver detalle" onAction={() => router.push({ pathname: '/mission/[id]', params: { id: mission.id } })} /><MissionCard state={state} mission={mission} /></View>
        <View style={styles.section}><SectionHeader title="Desafío activo" /><ChallengeCard state={state} challenge={challenge} /></View>
        <View style={styles.section}><SectionHeader title="Ingeniería esta semana" actionLabel="Ranking" onAction={() => router.push('/leaderboards')} /><Card style={styles.leaderboard}><View style={styles.rankSummary}><View style={styles.trophy}><Trophy size={30} color={colors.environmental} /></View><View style={{ flex: 1 }}><AppText variant="caption" style={{ color: colors.text }}>Subiste 2 puestos</AppText><AppText variant="h3">Estás #{currentRank}</AppText></View><ArrowUpRight color={colors.environmental} /></View><LeaderboardRows entries={leaderboard} limit={5} /></Card></View>
        <View style={styles.section}><SectionHeader title="Actividad de tu red" actionLabel="Actualizar" /><Card style={styles.feed}>{state.feed.slice(0, 5).map((event) => <FeedItem key={event.id} event={event} state={state} />)}</Card></View>
      </ScreenScroll>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screen: { maxWidth: 860, width: '100%', alignSelf: 'center', paddingTop: 22, gap: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recycleCta: { minHeight: 250, width: '100%', borderWidth: 2, padding: spacing.xxxl, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  recycleTitle: { color: '#000000', fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1.2, textAlign: 'center', textTransform: 'uppercase' },
  recycleDetail: { color: '#000000', fontWeight: '700', textAlign: 'center' },
  hero: { gap: spacing.xl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streak: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', gap: 7, alignItems: 'center' },
  heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroDivider: { width: 1, height: 38, backgroundColor: '#FFFFFF' },
  level: { gap: spacing.sm },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  section: { gap: spacing.md },
  feed: { paddingVertical: spacing.sm },
  leaderboard: { padding: spacing.sm },
  rankSummary: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  trophy: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
