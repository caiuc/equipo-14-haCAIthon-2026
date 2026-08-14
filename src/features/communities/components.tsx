import { LockKeyhole, TrendingUp, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, CommunityAvatar, Pill } from '@/design/components';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import { communityTotals, formatCompact, formatNumber } from '@/domain/rules';
import type { AppState, Community } from '@/domain/types';

export function CommunityCard({ community, state, variant = 'list' }: { community: Community; state: AppState; variant?: 'list' | 'feature' }) {
  const { colors } = useTheme();
  const router = useRouter();
  const totals = communityTotals(state, community, 'week');
  const joined = state.memberships.some((item) => item.userId === state.currentUserId && item.communityId === community.id);
  return (
    <Pressable onPress={() => router.push({ pathname: '/community/[id]', params: { id: community.id } })} accessibilityRole="link">
      {({ pressed }) => <Card style={[styles.card, variant === 'feature' && styles.feature, { opacity: pressed ? 0.76 : 1 }]}>
        <View style={styles.top}>
          <CommunityAvatar initials={community.initials} color={community.accent} size={variant === 'feature' ? 60 : 50} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={styles.nameRow}><AppText variant={variant === 'feature' ? 'h2' : 'h3'} numberOfLines={1}>{community.name}</AppText>{community.visibility === 'private' && <LockKeyhole size={14} color={colors.textMuted} />}</View>
            <View style={styles.meta}><UsersRound size={14} color={colors.textMuted} /><AppText variant="caption" style={{ color: colors.textMuted }}>{formatNumber(community.memberCountBaseline + state.memberships.filter((item) => item.communityId === community.id).length)} integrantes</AppText></View>
          </View>
          {joined && <Pill label="Tu comunidad" tone="positive" />}
        </View>
        {variant === 'feature' && <AppText numberOfLines={2} style={{ color: colors.textMuted }}>{community.description}</AppText>}
        <View style={styles.bottom}>
          <View><AppText variant="eyebrow" style={{ color: colors.textMuted }}>Esta semana</AppText><AppText variant="h3">{formatCompact(totals.points)} pts</AppText></View>
          <View style={styles.trend}><TrendingUp size={15} color={colors.environmental} /><AppText variant="caption" style={{ color: colors.environmental }}>+12%</AppText></View>
        </View>
      </Card>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.lg },
  feature: { minWidth: 280, maxWidth: 360, minHeight: 210 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  trend: { flexDirection: 'row', gap: 4, alignItems: 'center' },
});
