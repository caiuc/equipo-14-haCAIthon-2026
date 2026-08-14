import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, ChevronRight, Keyboard, Minus, Plus, ScanBarcode, Search, UsersRound } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Button, Card, EmptyState, ScreenScroll, SegmentedControl } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { calculateActionImpact, formatNumber } from '@/domain/rules';
import type { RecyclingAction } from '@/domain/types';
import { CameraScanner } from '@/features/recycling/CameraScanner';
import { CategorySelector } from '@/features/recycling/CategorySelector';
import { ImpactPreview } from '@/features/recycling/ImpactPreview';
import { ProductCard } from '@/features/recycling/ProductCard';
import { createProductLookupProvider, normalizeBarcode, type ScannedProduct } from '@/services/barcode/productLookup';
import { AppShell } from '@/navigation/AppShell';

type RecycleMode = 'scanner' | 'manual';
type LookupStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'invalid' | 'error';

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
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [activeBarcode, setActiveBarcode] = useState<string>();
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [lookupMessage, setLookupMessage] = useState<string>();
  const [product, setProduct] = useState<ScannedProduct>();
  const [submitError, setSubmitError] = useState<string>();
  const [successAction, setSuccessAction] = useState<RecyclingAction>();

  const selectedCategory = state.categories.find((item) => item.id === selectedCategoryId) ?? state.categories[0];
  const selectedCategoryEffectiveId = selectedCategory?.id;
  const preferredCommunity = joinedCommunities.find((item) => item.id === state.lastCommunityId) ?? joinedCommunities[0];
  const selectedCommunity = joinedCommunities.find((item) => item.id === selectedCommunityId) ?? preferredCommunity;
  const submitImpact = selectedCategory ? calculateActionImpact(selectedCategory, quantity) : undefined;
  const canSubmit = Boolean(hydrated && selectedCategory && selectedCommunity && quantity >= 1 && quantity <= 50);

  const resetProduct = useCallback(() => {
    lookupRequestId.current += 1;
    setActiveBarcode(undefined);
    setLookupStatus('idle');
    setLookupMessage(undefined);
    setProduct(undefined);
    setManualBarcode('');
  }, []);

  const lookupBarcode = useCallback(async (input: string) => {
    const barcode = normalizeBarcode(input);
    setSubmitError(undefined);
    setProduct(undefined);

    if (!barcode) {
      setActiveBarcode(undefined);
      setLookupStatus('invalid');
      setLookupMessage('Ingresa un código EAN o UPC válido.');
      return;
    }

    const requestId = lookupRequestId.current + 1;
    lookupRequestId.current = requestId;
    setActiveBarcode(barcode);
    setLookupStatus('loading');
    setLookupMessage(undefined);

    const result = await lookupProvider.lookup(barcode);
    if (lookupRequestId.current !== requestId) return;

    if (result.status === 'found') {
      setLookupStatus('found');
      setProduct(result.product);
      setLookupMessage(undefined);
      setManualBarcode(result.product.barcode);
      if (result.product.categoryId && state.categories.some((category) => category.id === result.product.categoryId)) {
        setSelectedCategoryId(result.product.categoryId);
      }
      return;
    }

    setProduct(undefined);
    setLookupStatus(result.status);
    setLookupMessage(result.message);
    setManualBarcode(barcode);
  }, [lookupProvider, state.categories]);

  const updateQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(50, current + delta)));
  };

  const updateManualBarcode = (value: string) => {
    setManualBarcode(value);
    if (activeBarcode && normalizeBarcode(value) !== activeBarcode) {
      lookupRequestId.current += 1;
      setActiveBarcode(undefined);
      setLookupStatus('idle');
      setLookupMessage(undefined);
      setProduct(undefined);
    }
  };

  const submit = () => {
    setSubmitError(undefined);
    if (!selectedCategory || !selectedCommunity) {
      setSubmitError('Selecciona una categoría y una comunidad receptora.');
      return;
    }

    try {
      const recorded = recordRecycling({
        categoryId: selectedCategory.id,
        communityId: selectedCommunity.id,
        quantity,
        note: note.trim() || undefined,
        source: activeBarcode ? 'barcode' : 'manual',
        barcode: activeBarcode,
      });
      setSuccessAction(recorded);
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
                  locked={lookupStatus === 'loading' || Boolean(activeBarcode && lookupStatus !== 'invalid')}
                  onBarcode={lookupBarcode}
                  onManualFallback={() => setMode('manual')}
                  onReset={resetProduct}
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
                  onChangeText={updateManualBarcode}
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

            {product && <ProductCard product={product} category={selectedCategory} onClear={resetProduct} />}

            <Card style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <ScanBarcode size={20} color={colors.primary} />
                <AppText variant="h2">Categoría</AppText>
              </View>
              <CategorySelector categories={state.categories} selectedId={selectedCategoryEffectiveId} onSelect={setSelectedCategoryId} />
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
                <AppText variant="h2">Cantidad</AppText>
              </View>
              <View style={styles.quantityRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Disminuir cantidad"
                  onPress={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                  style={({ pressed }) => [styles.stepButton, { backgroundColor: colors.surfaceMuted, opacity: quantity <= 1 ? 0.45 : pressed ? 0.75 : 1 }]}
                >
                  <Minus size={22} color={colors.text} />
                </Pressable>
                <View style={[styles.quantityValue, { borderColor: colors.border }]}>
                  <AppText variant="display">{quantity}</AppText>
                  <AppText variant="caption" style={{ color: colors.textMuted }}>unidades</AppText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Aumentar cantidad"
                  onPress={() => updateQuantity(1)}
                  disabled={quantity >= 50}
                  style={({ pressed }) => [styles.stepButton, { backgroundColor: colors.surfaceMuted, opacity: quantity >= 50 ? 0.45 : pressed ? 0.75 : 1 }]}
                >
                  <Plus size={22} color={colors.text} />
                </Pressable>
              </View>
              <ImpactPreview category={selectedCategory} quantity={quantity} />
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
                label={submitImpact ? `Confirmar +${formatNumber(submitImpact.points)} pts` : 'Confirmar reciclaje'}
                icon={CheckCircle2}
                onPress={submit}
                disabled={!canSubmit}
              />
            </Card>
          </View>
        </View>
      </ScreenScroll>
      <SuccessModal
        action={successAction}
        communityName={selectedCommunity?.name}
        onClose={() => setSuccessAction(undefined)}
        onReset={() => {
          setSuccessAction(undefined);
          resetProduct();
          setQuantity(1);
          setMode('scanner');
        }}
      />
    </AppShell>
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
  action,
  communityName,
  onClose,
  onReset,
}: {
  action?: RecyclingAction;
  communityName?: string;
  onClose: () => void;
  onReset: () => void;
}) {
  const { colors } = useTheme();
  if (!action) return null;
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, { backgroundColor: colors.scrim }]}>
        <Card style={styles.modalCard}>
          <View style={[styles.successIcon, { backgroundColor: colors.environmentalSoft }]}>
            <CheckCircle2 size={34} color={colors.environmental} />
          </View>
          <AppText variant="h1" style={{ textAlign: 'center' }}>Reciclaje registrado</AppText>
          <AppText style={{ color: colors.textMuted, textAlign: 'center' }}>
            Sumaste {formatNumber(action.points)} puntos a {communityName ?? 'tu comunidad'} con {action.quantity} {action.quantity === 1 ? 'unidad' : 'unidades'}.
          </AppText>
          <View style={styles.modalActions}>
            <Button label="Registrar otro" icon={Plus} onPress={onReset} />
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
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stepButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    flex: 1,
    minHeight: 94,
    borderRadius: radius.lg,
    borderWidth: 1,
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
