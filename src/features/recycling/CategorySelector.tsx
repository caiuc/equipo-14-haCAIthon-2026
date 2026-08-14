import { StyleSheet, View } from 'react-native';

import { AppText, CategoryBadge } from '@/design/components';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import type { RecyclingCategory } from '@/domain/types';

export function CategorySelector({
  categories,
  selectedId,
  onSelect,
}: {
  categories: RecyclingCategory[];
  selectedId?: string;
  onSelect: (categoryId: string) => void;
}) {
  const { colors } = useTheme();
  const selected = categories.find((item) => item.id === selectedId);
  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {categories.map((category) => (
          <CategoryBadge
            key={category.id}
            category={category}
            selected={category.id === selectedId}
            onPress={() => onSelect(category.id)}
          />
        ))}
      </View>
      {selected && (
        <View style={styles.detail}>
          <View style={[styles.swatch, { backgroundColor: selected.color }]} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="bodyStrong">{selected.name}</AppText>
            <AppText style={{ color: colors.textMuted }}>{selected.guidance}</AppText>
            <AppText variant="caption" style={{ color: colors.textMuted }}>{selected.preparation}</AppText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detail: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  swatch: {
    width: 10,
    height: 44,
    borderRadius: 8,
  },
});
