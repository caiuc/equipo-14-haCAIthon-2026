import { Award, Recycle, TrendingUp, UserPlus, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { formatRelativeDate } from '@/domain/rules';
import type { ActivityEvent, AppState } from '@/domain/types';

export function FeedItem({ event, state }: { event: ActivityEvent; state: AppState }) {
  const { colors } = useTheme();
  const router = useRouter();
  const actor = state.profiles.find((item) => item.id === event.actorId);
  const icons = {
    recycling_recorded: Recycle,
    challenge_completed: Award,
    badge_earned: Award,
    level_reached: TrendingUp,
    community_joined: UserPlus,
    mission_completed: UsersRound,
    ranking_milestone: TrendingUp,
  };
  const Icon = icons[event.type];
  const goToDetail = () => {
    if (event.recyclingActionId) router.push({ pathname: '/activity/[id]', params: { id: event.recyclingActionId } });
  };
  return (
    <Pressable onPress={goToDetail} disabled={!event.recyclingActionId} style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}>
      {actor ? <Avatar initials={actor.initials} color={actor.avatarColor} size={43} /> : <View style={[styles.icon, { backgroundColor: colors.surfaceMuted }]}><Icon size={20} color={colors.primary} /></View>}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText variant="bodyStrong">{event.title}</AppText>
        <AppText variant="caption" style={{ color: colors.textMuted }}>{event.detail}</AppText>
        <AppText variant="caption" style={{ color: colors.textMuted, marginTop: 3 }}>{formatRelativeDate(event.createdAt)}</AppText>
      </View>
      {event.points && <View style={[styles.points, { backgroundColor: colors.environmentalSoft }]}><AppText variant="caption" style={{ color: colors.environmental }}>+{event.points}</AppText></View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.md },
  icon: { width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  points: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5 },
});
