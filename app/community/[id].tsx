import { ArrowLeft, LockKeyhole, MoreHorizontal, Share2, ShieldCheck } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Button, Card, CommunityAvatar, Pill, ScreenScroll, SectionHeader } from '@/design/components';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import { buildCommunityLeaderboard, buildUserLeaderboard, communityTotals, formatNumber } from '@/domain/rules';
import { LeaderboardRows } from '@/features/leaderboards/components';
import { ChallengeCard } from '@/features/missions/components';
import { FeedItem } from '@/features/social/components';
import { AppShell } from '@/navigation/AppShell';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { state, joinCommunity, leaveCommunity } = useRetornaStore();
  const router = useRouter();
  const community = state.communities.find((item) => item.id === id);
  const joined = state.memberships.some((item) => item.userId === state.currentUserId && item.communityId === id);
  const role = state.memberships.find((item) => item.userId === state.currentUserId && item.communityId === id)?.role;
  const totals = community ? communityTotals(state, community) : undefined;
  const rank = community ? buildCommunityLeaderboard(state, 'week').find((item) => item.id === community.id)?.rank : undefined;
  const members = community ? buildUserLeaderboard(state, 'week', community.id) : [];
  const challenge = state.challenges.find((item) => item.communityId === id && item.status === 'active');
  const feed = state.feed.filter((item) => item.communityId === id).slice(0, 5);
  if (!community || !totals) return <AppShell><View style={styles.center}><AppText variant="h2">Comunidad no disponible</AppText><Button label="Volver" onPress={() => router.back()} /></View></AppShell>;
  return (
    <AppShell>
      <ScreenScroll contentContainerStyle={styles.screen}>
        <View style={styles.topActions}><Pressable onPress={() => router.back()} style={[styles.circleButton, { backgroundColor: colors.surface }]}><ArrowLeft color={colors.text} /></Pressable><View style={styles.actionGroup}><Pressable style={[styles.circleButton, { backgroundColor: colors.surface }]}><Share2 size={19} color={colors.text} /></Pressable><Pressable style={[styles.circleButton, { backgroundColor: colors.surface }]}><MoreHorizontal color={colors.text} /></Pressable></View></View>
        <Card style={[styles.headerCard, { borderTopColor: colors.primary }]}>
          <View style={styles.identity}><CommunityAvatar initials={community.initials} color={community.accent} size={76} /><View style={{ flex: 1, gap: 6 }}><View style={styles.nameRow}><AppText variant="h1">{community.name}</AppText>{community.visibility === 'private' && <LockKeyhole size={18} color={colors.textMuted} />}</View><View style={styles.tagRow}>{community.tags.map((tag) => <Pill key={tag} label={tag} />)}{role && <Pill label={role === 'owner' ? 'Propietaria' : role === 'admin' ? 'Admin' : 'Integrante'} tone="positive" />}</View></View></View>
          <AppText style={{ color: colors.textMuted, maxWidth: 760 }}>{community.description}</AppText>
          <View style={styles.communityStats}><View><AppText variant="metric">{formatNumber(totals.points)}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>puntos históricos</AppText></View><View><AppText variant="metric">#{rank}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>esta semana</AppText></View><View><AppText variant="metric">{formatNumber(community.memberCountBaseline + state.memberships.filter((item) => item.communityId === id).length)}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>integrantes</AppText></View><View><AppText variant="metric">{totals.estimatedKg} kg</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>reciclaje estimado</AppText></View></View>
          <View style={styles.headerButtons}>{joined ? <><Button label="Registrar aporte" onPress={() => router.push({ pathname: '/recycle', params: { communityId: id } })} style={{ flex: 1 }} /><Button label={role === 'owner' ? 'Gestionar' : 'Salir'} variant="secondary" onPress={role === 'owner' ? undefined : () => leaveCommunity(id)} /></> : <Button label={community.visibility === 'public' ? 'Unirme a la comunidad' : 'Solicitar acceso'} onPress={() => joinCommunity(id)} style={{ flex: 1 }} />}</View>
        </Card>

        <View style={styles.twoColumns}>
          <View style={styles.mainColumn}>
            {challenge && <View style={styles.section}><SectionHeader title="Desafío activo" /><ChallengeCard state={state} challenge={challenge} /></View>}
            <View style={styles.section}><SectionHeader title="Actividad reciente" />{feed.length ? <Card style={{ paddingVertical: spacing.sm }}>{feed.map((event) => <FeedItem key={event.id} event={event} state={state} />)}</Card> : <Card><AppText variant="h3">La próxima historia puede ser la tuya.</AppText><AppText style={{ color: colors.textMuted }}>Registra un reciclaje para activar el feed de esta comunidad.</AppText></Card>}</View>
          </View>
          <View style={styles.sideColumn}>
            <View style={styles.section}><SectionHeader title="Ranking interno" actionLabel="Ver todos" onAction={() => router.push({ pathname: '/leaderboards', params: { communityId: id } })} /><Card style={{ padding: spacing.sm }}><LeaderboardRows entries={members} limit={6} /></Card></View>
            <Card style={styles.trust}><View style={styles.shield}><ShieldCheck color={colors.environmental} size={30} /></View><View style={{ flex: 1 }}><AppText variant="bodyStrong">Competencia de buena fe</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>Toda actividad queda visible y puede corregirse.</AppText></View></Card>
          </View>
        </View>
      </ScreenScroll>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screen: { maxWidth: 1120, width: '100%', alignSelf: 'center', paddingTop: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  topActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionGroup: { flexDirection: 'row', gap: spacing.sm },
  circleButton: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center' },
  headerCard: { borderTopWidth: 7, gap: spacing.xl },
  identity: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  tagRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  communityStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxxl, justifyContent: 'space-between' },
  headerButtons: { flexDirection: 'row', gap: spacing.md },
  twoColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, alignItems: 'flex-start' },
  mainColumn: { flex: 1.3, minWidth: 310, gap: spacing.xxl },
  sideColumn: { flex: 0.8, minWidth: 300, gap: spacing.xxl },
  section: { gap: spacing.md },
  trust: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  shield: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
