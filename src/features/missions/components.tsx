import { ArrowRight, Clock3, Flag, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Pill, ProgressBar } from '@/design/components';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import { challengeProgress, daysRemaining, formatNumber, missionProgress } from '@/domain/rules';
import type { AppState, Challenge, Mission } from '@/domain/types';

export function MissionCard({ state, mission, compact = false }: { state: AppState; mission: Mission; compact?: boolean }) {
  const { colors } = useTheme();
  const router = useRouter();
  const progress = missionProgress(state, mission);
  const days = daysRemaining(mission.endAt);
  return (
    <Pressable onPress={() => router.push({ pathname: '/mission/[id]', params: { id: mission.id } })} accessibilityRole="link">
      {({ pressed }) => (
        <Card style={[styles.mission, { backgroundColor: colors.surfaceStrong, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }, compact && styles.compact]}>
          <View style={styles.missionTop}>
            <View style={styles.artwork}>
              <Flag size={34} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <AppText variant="eyebrow" style={{ color: colors.primary }}>Misión de toda la UC</AppText>
              <AppText variant={compact ? 'h3' : 'h2'} style={{ color: colors.textOnStrong }}>{mission.shortTitle}</AppText>
            </View>
            <ArrowRight size={20} color={colors.textOnStrong} />
          </View>
          {!compact && <AppText style={{ color: colors.textOnStrong }}>{mission.description}</AppText>}
          <View style={styles.progressLabels}>
            <AppText variant="bodyStrong" style={{ color: colors.textOnStrong }}>{formatNumber(progress.value)} de {formatNumber(mission.target)}</AppText>
            <AppText variant="bodyStrong" style={{ color: colors.environmental }}>{Math.round(progress.percent)}%</AppText>
          </View>
          <ProgressBar value={progress.percent} color={colors.environmental} accessibilityLabel={`Progreso misión ${Math.round(progress.percent)} por ciento`} />
          <View style={styles.metaRow}>
            <View style={styles.meta}><UsersRound size={15} color={colors.textOnStrong} /><AppText variant="caption" style={{ color: colors.textOnStrong }}>{progress.participatingCommunities} comunidades</AppText></View>
            <View style={styles.meta}><Clock3 size={15} color={colors.textOnStrong} /><AppText variant="caption" style={{ color: colors.textOnStrong }}>{days} días restantes</AppText></View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

export function ChallengeCard({ state, challenge, compact = false }: { state: AppState; challenge: Challenge; compact?: boolean }) {
  const { colors } = useTheme();
  const progress = challengeProgress(state, challenge);
  const community = state.communities.find((item) => item.id === challenge.communityId);
  return (
    <Card style={[styles.challenge, compact && { padding: spacing.lg }]}>
      <View style={styles.challengeTop}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="eyebrow" style={{ color: colors.primary }}>{community?.name ?? 'Comunidad'}</AppText>
          <AppText variant="h3">{challenge.title}</AppText>
        </View>
        <Pill label={`${daysRemaining(challenge.endAt)} días`} />
      </View>
      {!compact && <AppText style={{ color: colors.textMuted }}>{challenge.description}</AppText>}
      <ProgressBar value={progress.percent} color={colors.primary} />
      <View style={styles.progressLabels}>
        <AppText variant="caption" style={{ color: colors.textMuted }}>{formatNumber(progress.value)} {challenge.unitLabel}</AppText>
        <AppText variant="caption" style={{ color: colors.textMuted }}>Faltan {formatNumber(progress.remaining)}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  mission: { gap: spacing.lg, overflow: 'hidden' },
  compact: { padding: spacing.lg },
  missionTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  artwork: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  challenge: { gap: spacing.md },
  challengeTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
});
