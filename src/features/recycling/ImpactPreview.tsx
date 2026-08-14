import { StyleSheet, View } from 'react-native';

import { AppText } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { calculateActionImpact, formatNumber } from '@/domain/rules';
import type { RecyclingCategory } from '@/domain/types';

export function ImpactPreview({ category, quantity }: { category?: RecyclingCategory; quantity: number }) {
  const { colors } = useTheme();
  if (!category) {
    return (
      <View style={[styles.root, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
        <AppText variant="bodyStrong">Selecciona una categoría para calcular el impacto.</AppText>
      </View>
    );
  }

  const impact = calculateActionImpact(category, quantity);
  const items = [
    { label: 'Puntos', value: `+${formatNumber(impact.points)}` },
    { label: 'Residuos estimados', value: `${formatNumber(impact.estimatedKg, 2)} kg` },
    { label: 'CO2 estimado', value: `${formatNumber(impact.estimatedCo2Kg, 2)} kg` },
  ];

  return (
    <View style={[styles.root, { borderColor: `${category.color}42`, backgroundColor: `${category.color}12` }]}>
      {items.map((item) => (
        <View key={item.label} style={styles.metric}>
          <AppText variant="metric" style={{ color: category.color }}>{item.value}</AppText>
          <AppText variant="caption" style={{ color: colors.textMuted }}>{item.label}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  metric: {
    flex: 1,
    minWidth: 130,
    gap: 3,
  },
});
