import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, ChevronRight, Keyboard, Minus, PackageSearch, Plus, ScanBarcode, Search, Trash2, UsersRound } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Button, Card, EmptyState, Pill, ScreenScroll, SegmentedControl } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { calculateActionImpact, formatNumber } from '@/domain/rules';
import type { RecyclingCategory } from '@/domain/types';
import { CameraScanner } from '@/features/recycling/CameraScanner';
import { CategorySelector } from '@/features/recycling/CategorySelector';
import { createProductLookupProvider, normalizeBarcode, type ScannedProduct } from '@/services/barcode/productLookup';
import { AppShell } from '@/navigation/AppShell';

type RecycleMode = 'scanner' | 'manual';
type LookupStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'invalid' | 'error';

interface CartItem {
  id: string;
  barcode?: string;
  product?: ScannedProduct;
  categoryId: string;
  quantity: number;
}

interface SubmitSummary {
  points: number;
  itemCount: number;
}

export default function RecycleRoute() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1080;
  const { state, hydrated, joinedCommunities, recordRecycling } = useRetornaStore();
  const lookupProvider = useMemo(() => createProductLookupProvider(), []);
  const lookupRequestId = useRef(0);

  const firstCategoryId = state.categories[0]?.id ?? '';
  const [mode, setMode] = useState<RecycleMode>('scanner');
  const [selectedCategoryId, setSelectedCategoryId] = useState(firstCategoryId);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [note, setNote] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [lookupMessage, setLookupMessage] = useState<string>();
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitError, setSubmitError] = useState<string>();
  const [successSummary, setSuccessSummary] = useState<SubmitSummary>();

  const selectedCategory = state.categories.find((item) => item.id === selectedCategoryId) ?? state.categories[0];
  const selectedCategoryEffectiveId = selectedCategory?.id;
  const preferredCommunity = joinedCommunities.find((item) => item.id === state.lastCommunityId) ?? joinedCommunities[0];
  const selectedCommunity = joinedCommunities.find((item) => item.id === selectedCommunityId) ?? preferredCommunity;
  const categoryById = useMemo(() => new Map(state.categories.map((category) => [category.id, category])), [state.categories]);
  const totals = useMemo(() => items.reduce((acc, item) => {
    const category = categoryById.get(item.categoryId);
    if (!category) return acc;
    const impact = calculateActionImpact(category, item.quantity);
    return {
      points: acc.points + impact.points,
      kg: acc.kg + impact.estimatedKg,
      co2: acc.co2 + impact.estimatedCo2Kg,
      quantity: acc.quantity + item.quantity,
    };
  }, { points: 0, kg: 0, co2: 0, quantity: 0 }), [items, categoryById]);
  const canSubmit = Boolean(hydrated && selectedCommunity && items.length > 0 && items.every((item) => item.quantity >= 1 && item.quantity <= 50));

  const addScannedItem = useCallback((product: ScannedProduct) => {
    const categoryId = product.categoryId && categoryById.has(product.categoryId) ? product.categoryId : firstCategoryId;
    setItems((current) => {
      const existing = current.find((item) => item.barcode === product.barcode);
      if (existing) {
        return current.map((item) => (item.barcode === product.barcode ? { ...item, quantity: Math.min(50, item.quantity + 1) } : item));
      }
      return [...current, { id: product.barcode, barcode: product.barcode, product, categoryId, quantity: 1 }];
    });
  }, [categoryById, firstCategoryId]);

  const addManualItem = useCallback(() => {
    if (!selectedCategory) return;
    setItems((current) => [...current, { id: `manual-${Date.now()}`, categoryId: selectedCategory.id, quantity: 1 }]);
  }, [selectedCategory]);

  const lookupBarcode = useCallback(async (input: string) => {
    const barcode = normalizeBarcode(input);
    setSubmitError(undefined);

    if (!barcode) {
      setLookupStatus('invalid');
      setLookupMessage('Ingresa un código EAN o UPC válido.');
      return;
    }

    const requestId = lookupRequestId.current + 1;
    lookupRequestId.current = requestId;
    setLookupStatus('loading');
    setLookupMessage(undefined);

    const result = await lookupProvider.lookup(barcode);
    if (lookupRequestId.current !== requestId) return;

    if (result.status === 'found') {
      setLookupStatus('found');
      setLookupMessage(`Agregado: ${result.product.name}`);
      addScannedItem(result.product);
      setManualBarcode('');
      return;
    }

    setLookupStatus(result.status);
    setLookupMessage(result.message);
  }, [lookupProvider, addScannedItem]);

  const updateItemQuantity = (id: string, delta: number) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Math.min(50, item.quantity + delta)) } : item)));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const submit = () => {
    setSubmitError(undefined);
    if (!selectedCommunity || !items.length) {
      setSubmitError('Escanea o agrega al menos un material y elige una comunidad receptora.');
      return;
    }

    try {
      let totalPoints = 0;
      for (const item of items) {
        const category = categoryById.get(item.categoryId);
        if (!category) continue;
        const recorded = recordRecycling({
          categoryId: category.id,
          communityId: selectedCommunity.id,
          quantity: item.quantity,
          note: note.trim() || undefined,
          source: item.barcode ? 'barcode' : 'manual',
          barcode: item.barcode,
        });
        totalPoints += recorded.points;
      }
      setSuccessSummary({ points: totalPoints, itemCount: items.length });
      setNote('');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos registrar el reciclaje.');
    }
  };

  if (!hydrated) {
    return (
      <AppShell>
        <ScreenScroll contentContainerStyle={styles.loadingScreen}>
          <Card style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
            <AppText style={{ color: colors.textMuted }}>Cargando tu sesión...</AppText>
          </Card>
        </ScreenScroll>
      </AppShell>
    );
  }

  if (!joinedCommunities.length) {
    return (
      <AppShell>
        <ScreenScroll contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <View>
              <AppText variant="eyebrow" style={{ color: colors.primary }}>Registrar reciclaje</AppText>
              <AppText variant="h1">Elige una comunidad primero</AppText>
            </View>
          </View>
          <EmptyState
            icon={UsersRound}
            title="Aún no perteneces a comunidades"
            detail="Para aportar puntos, únete a una comunidad pública o crea una con tu grupo."
            action={<Button label="Ver comunidades" icon={ChevronRight} onPress={() => router.push('/communities')} />}
          />
        </ScreenScroll>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenScroll contentContainerStyle={[styles.screen, wide && styles.screenWide]}>
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="eyebrow" style={{ color: colors.primary }}>Registrar reciclaje</AppText>
            <AppText variant="h1">Suma puntos a tu comunidad</AppText>
            <AppText style={{ color: colors.textMuted }}>Registra materiales limpios y separados. Las cifras ambientales son estimaciones.</AppText>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.environmentalSoft }]}>
            <AppText variant="bodyStrong" style={{ color: colors.environmental }}>{joinedCommunities.length}</AppText>
            <AppText variant="caption" style={{ color: colors.environmental }}>comunidades</AppText>
          </View>
        </View>

        <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={styles.primaryColumn}>
            <Card style={styles.modeCard}>
              <SegmentedControl
                values={[
                  { value: 'scanner', label: 'Escanear' },
                  { value: 'manual', label: 'Manual' },
                ]}
                selected={mode}
                onChange={setMode}
              />
              {mode === 'scanner' ? (
                <CameraScanner
                  onBarcode={(barcode) => void lookupBarcode(barcode)}
                  onManualFallback={() => setMode('manual')}
                />
              ) : (
                <View style={[styles.manualPanel, { backgroundColor: colors.surfaceMuted }]}>
                  <View style={[styles.manualIcon, { backgroundColor: colors.surface }]}>
                    <Keyboard size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText variant="h3">Registro manual</AppText>
                    <AppText style={{ color: colors.textMuted }}>Elige el material o busca por código si lo tienes a mano.</AppText>
                  </View>
                </View>
              )}

              <View style={styles.barcodeSearch}>
                <TextInput
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  keyboardType="number-pad"
                  placeholder="Código de barras opcional"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                  accessibilityLabel="Código de barras"
                />
                <Button
                  label="Buscar"
                  icon={Search}
                  variant="secondary"
                  compact
                  loading={lookupStatus === 'loading'}
                  onPress={() => void lookupBarcode(manualBarcode)}
                />
              </View>

              {lookupStatus === 'loading' && <LookupNotice tone="neutral" message="Buscando información del producto..." />}
              {lookupMessage && <LookupNotice tone={lookupStatus === 'error' || lookupStatus === 'invalid' ? 'danger' : 'neutral'} message={lookupMessage} />}
            </Card>

            <Card style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <ScanBarcode size={20} color={colors.primary} />
                <AppText variant="h2">Material para agregar manualmente</AppText>
              </View>
              <CategorySelector categories={state.categories} selectedId={selectedCategoryEffectiveId} onSelect={setSelectedCategoryId} />
              <Button label="Agregar a la lista" icon={Plus} variant="secondary" onPress={addManualItem} disabled={!selectedCategory} />
            </Card>

            <Card style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <PackageSearch size={20} color={colors.primary} />
                <AppText variant="h2">Materiales escaneados ({items.length})</AppText>
              </View>
              {items.length ? (
                <View style={{ gap: spacing.md }}>
                  {items.map((item) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      category={categoryById.get(item.categoryId)}
                      onIncrement={() => updateItemQuantity(item.id, 1)}
                      onDecrement={() => updateItemQuantity(item.id, -1)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </View>
              ) : (
                <AppText style={{ color: colors.textMuted }}>Escanea o agrega materiales para verlos aquí.</AppText>
              )}
            </Card>
          </View>

          <View style={styles.sideColumn}>
            <Card style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <UsersRound size={20} color={colors.primary} />
                <AppText variant="h2">Comunidad receptora</AppText>
              </View>
              <View style={styles.communityList}>
                {joinedCommunities.map((community) => {
                  const selected = community.id === selectedCommunity?.id;
                  return (
                    <Pressable
                      key={community.id}
                      onPress={() => setSelectedCommunityId(community.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      style={({ pressed }) => [
                        styles.communityOption,
                        {
                          borderColor: selected ? community.accent : colors.border,
                          backgroundColor: selected ? `${community.accent}16` : colors.surface,
                          opacity: pressed ? 0.78 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.communityMark, { backgroundColor: community.accent }]}>
                        <AppText variant="caption" style={{ color: '#FFFFFF' }}>{community.initials}</AppText>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <AppText variant="bodyStrong">{community.name}</AppText>
                        <AppText variant="caption" style={{ color: colors.textMuted }}>{community.tags.join(' · ')}</AppText>
                      </View>
                      {selected && <CheckCircle2 size={19} color={community.accent} />}
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Plus size={20} color={colors.primary} />
                <AppText variant="h2">Resumen</AppText>
              </View>
              <View style={[styles.summaryRow, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                <View style={styles.summaryMetric}>
                  <AppText variant="display">{items.length}</AppText>
                  <AppText variant="caption" style={{ color: colors.textMuted }}>materiales</AppText>
                </View>
                <View style={styles.summaryMetric}>
                  <AppText variant="display">{totals.quantity}</AppText>
                  <AppText variant="caption" style={{ color: colors.textMuted }}>unidades</AppText>
                </View>
                <View style={styles.summaryMetric}>
                  <AppText variant="display" style={{ color: colors.environmental }}>+{formatNumber(totals.points)}</AppText>
                  <AppText variant="caption" style={{ color: colors.textMuted }}>puntos</AppText>
                </View>
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Nota opcional"
                placeholderTextColor={colors.textMuted}
                style={[styles.noteInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                multiline
                maxLength={180}
                accessibilityLabel="Nota opcional"
              />
              {submitError && <LookupNotice tone="danger" message={submitError} />}
              <Button
                label={items.length ? `Confirmar +${formatNumber(totals.points)} pts` : 'Confirmar reciclaje'}
                icon={CheckCircle2}
                onPress={submit}
                disabled={!canSubmit}
              />
            </Card>
          </View>
        </View>
      </ScreenScroll>
      <SuccessModal
        summary={successSummary}
        communityName={selectedCommunity?.name}
        onClose={() => setSuccessSummary(undefined)}
        onReset={() => {
          setSuccessSummary(undefined);
          setItems([]);
          setMode('scanner');
        }}
      />
    </AppShell>
  );
}

function CartRow({
  item,
  category,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  category?: RecyclingCategory;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const impact = category ? calculateActionImpact(category, item.quantity) : undefined;
  return (
    <View style={[styles.cartRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {item.product?.imageUrl ? (
        <Image source={{ uri: item.product.imageUrl }} style={[styles.cartImage, { backgroundColor: colors.surfaceMuted }]} resizeMode="cover" />
      ) : (
        <View style={[styles.cartImage, styles.cartImageFallback, { backgroundColor: colors.surfaceMuted }]}>
          <PackageSearch size={22} color={colors.textMuted} />
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>{item.product?.name ?? category?.name ?? 'Material'}</AppText>
        <View style={styles.pills}>
          {category && <Pill label={category.shortName} tone="positive" />}
          {item.barcode && <Pill label={item.barcode} tone="neutral" />}
        </View>
        {impact && <AppText variant="caption" style={{ color: colors.textMuted }}>+{formatNumber(impact.points)} pts · {formatNumber(impact.estimatedKg, 2)} kg</AppText>}
      </View>
      <View style={styles.cartActions}>
        <View style={styles.cartStepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Disminuir cantidad"
            onPress={onDecrement}
            disabled={item.quantity <= 1}
            style={({ pressed }) => [styles.cartStepButton, { backgroundColor: colors.surfaceMuted, opacity: item.quantity <= 1 ? 0.45 : pressed ? 0.75 : 1 }]}
          >
            <Minus size={16} color={colors.text} />
          </Pressable>
          <AppText variant="bodyStrong" style={styles.cartQuantity}>{item.quantity}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aumentar cantidad"
            onPress={onIncrement}
            disabled={item.quantity >= 50}
            style={({ pressed }) => [styles.cartStepButton, { backgroundColor: colors.surfaceMuted, opacity: item.quantity >= 50 ? 0.45 : pressed ? 0.75 : 1 }]}
          >
            <Plus size={16} color={colors.text} />
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quitar material"
          onPress={onRemove}
          style={({ pressed }) => [styles.cartRemove, { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.7 : 1 }]}
        >
          <Trash2 size={16} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

function LookupNotice({ message, tone }: { message: string; tone: 'neutral' | 'danger' }) {
  const { colors } = useTheme();
  const danger = tone === 'danger';
  return (
    <View style={[styles.notice, { backgroundColor: danger ? colors.dangerSoft : colors.surfaceMuted }]}>
      <AlertCircle size={18} color={danger ? colors.danger : colors.textMuted} />
      <AppText style={{ color: danger ? colors.danger : colors.textMuted, flex: 1 }}>{message}</AppText>
    </View>
  );
}

function SuccessModal({
  summary,
  communityName,
  onClose,
  onReset,
}: {
  summary?: SubmitSummary;
  communityName?: string;
  onClose: () => void;
  onReset: () => void;
}) {
  const { colors } = useTheme();
  if (!summary) return null;
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, { backgroundColor: colors.scrim }]}>
        <Card style={styles.modalCard}>
          <View style={[styles.successIcon, { backgroundColor: colors.environmentalSoft }]}>
            <CheckCircle2 size={34} color={colors.environmental} />
          </View>
          <AppText variant="h1" style={{ textAlign: 'center' }}>Reciclaje registrado</AppText>
          <AppText style={{ color: colors.textMuted, textAlign: 'center' }}>
            Sumaste {formatNumber(summary.points)} puntos a {communityName ?? 'tu comunidad'} con {summary.itemCount} {summary.itemCount === 1 ? 'material' : 'materiales'}.
          </AppText>
          <View style={styles.modalActions}>
            <Button label="Registrar más" icon={Plus} onPress={onReset} />
            <Button label="Listo" variant="secondary" onPress={onClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 22,
  },
  screenWide: {
    maxWidth: 1240,
  },
  loadingScreen: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  headerBadge: {
    minWidth: 92,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  columns: {
    gap: spacing.xl,
  },
  columnsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  primaryColumn: {
    flex: 1.25,
    minWidth: 0,
    gap: spacing.xl,
  },
  sideColumn: {
    flex: 0.85,
    minWidth: 320,
    gap: spacing.xl,
  },
  modeCard: {
    gap: spacing.lg,
  },
  sectionCard: {
    gap: spacing.lg,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  manualPanel: {
    minHeight: 164,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  manualIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeSearch: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  notice: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  communityList: {
    gap: spacing.sm,
  },
  communityOption: {
    minHeight: 64,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  communityMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryMetric: {
    flex: 1,
    gap: 3,
  },
  cartRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cartImage: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
  },
  cartImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cartActions: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  cartStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cartStepButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartQuantity: {
    minWidth: 20,
    textAlign: 'center',
  },
  cartRemove: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    alignItems: 'center',
    gap: spacing.lg,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
