import { ArrowDown, ArrowUp, Minus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, CommunityAvatar } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { formatNumber } from '@/domain/rules';
import type { LeaderboardEntry } from '@/domain/types';

export function LeaderboardRows({ entries, kind = 'users', limit }: { entries: LeaderboardEntry[]; kind?: 'users' | 'communities'; limit?: number }) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.list}>
      {entries.slice(0, limit).map((entry) => {
        const movement = entry.movement ?? 0;
        const MovementIcon = movement > 0 ? ArrowUp : movement < 0 ? ArrowDown : Minus;
        return (
          <Pressable
            key={entry.id}
            onPress={() => kind === 'communities' ? router.push({ pathname: '/community/[id]', params: { id: entry.id } }) : undefined}
            style={({ pressed }) => [styles.row, entry.isCurrent && { backgroundColor: colors.environmentalSoft }, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.rankWrap}>
              <AppText variant={entry.rank <= 3 ? 'h3' : 'bodyStrong'} style={{ color: entry.rank <= 3 ? colors.primary : colors.textMuted }}>#{entry.rank}</AppText>
              <MovementIcon size={12} color={movement > 0 ? colors.environmental : colors.textMuted} />
            </View>
            {kind === 'communities' ? <CommunityAvatar initials={entry.initials} color={entry.color} size={42} /> : <Avatar initials={entry.initials} color={entry.color} size={42} />}
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="bodyStrong" numberOfLines={1}>{entry.name}{entry.isCurrent ? ' · Tú' : ''}</AppText>
              {entry.subtitle && <AppText variant="caption" numberOfLines={1} style={{ color: colors.textMuted }}>{entry.subtitle}</AppText>}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="bodyStrong">{formatNumber(entry.points)}</AppText>
              <AppText variant="caption" style={{ color: colors.textMuted }}>pts</AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 4 },
  row: { minHeight: 64, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankWrap: { width: 35, alignItems: 'center', gap: 1 },
});
