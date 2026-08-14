import { Image, Pressable, StyleSheet, View } from 'react-native';
import { CheckCircle2, PackageSearch, X } from 'lucide-react-native';

import { AppText, Card, Pill } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import type { RecyclingCategory } from '@/domain/types';
import type { ScannedProduct } from '@/services/barcode/productLookup';

export function ProductCard({
  product,
  category,
  onClear,
}: {
  product: ScannedProduct;
  category?: RecyclingCategory;
  onClear: () => void;
}) {
  const { colors } = useTheme();
  const sourceLabel = product.source === 'local' ? 'Catálogo local' : 'Open Food Facts';
  const confidenceLabel = product.categoryConfidence === 'high' ? 'alta' : product.categoryConfidence === 'medium' ? 'media' : 'baja';
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={[styles.image, { backgroundColor: colors.surfaceMuted }]} resizeMode="cover" />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: colors.surfaceMuted }]}>
            <PackageSearch size={28} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.productText}>
          <View style={styles.titleRow}>
            <AppText variant="caption" style={{ color: colors.textMuted }}>{product.barcode}</AppText>
            <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel="Limpiar producto escaneado" style={({ pressed }) => [styles.clearButton, { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.7 : 1 }]}>
              <X size={17} color={colors.textMuted} />
            </Pressable>
          </View>
          <AppText variant="h3">{product.name}</AppText>
          {product.brand && <AppText style={{ color: colors.textMuted }}>{product.brand}</AppText>}
          <View style={styles.pills}>
            <Pill label={sourceLabel} tone="neutral" />
            {category && <Pill label={category.shortName} tone="positive" />}
          </View>
        </View>
      </View>

      <View style={[styles.preparation, { backgroundColor: colors.environmentalSoft }]}>
        <CheckCircle2 size={19} color={colors.environmental} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="bodyStrong" style={{ color: colors.environmental }}>Preparación sugerida</AppText>
          <AppText style={{ color: colors.text }}>{product.preparation}</AppText>
          {product.packagingSummary && <AppText variant="caption" style={{ color: colors.textMuted }}>Empaque detectado: {product.packagingSummary} · confianza {confidenceLabel}</AppText>}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: radius.md,
  },
  imageFallback: {
    width: 86,
    height: 86,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productText: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 3,
  },
  preparation: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
});
