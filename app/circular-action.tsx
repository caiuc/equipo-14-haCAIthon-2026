import type { LucideIcon } from 'lucide-react-native';
import {
  ArrowRight,
  BatteryMedium,
  Camera,
  Check,
  ChevronLeft,
  CircleGauge,
  CupSoda,
  PackageOpen,
  Recycle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { circularActions } from '@/data/circularActionSeed';
import { AppText, Button, Card, Pill, ProgressBar, ScreenScroll } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import {
  circularMissionProgress,
  type CircularActionDefinition,
  type CircularActionRegistration,
  type CircularChallengeProgress,
  pointsForCircularAction,
  registerCircularAction,
} from '@/domain/circularAction';

const actionIcons: Record<CircularActionDefinition['icon'], LucideIcon> = {
  cup: CupSoda,
  package: PackageOpen,
  recycle: Recycle,
  battery: BatteryMedium,
};

const kindLabels: Record<CircularActionDefinition['kind'], string> = {
  prevention: 'Prevenir',
  reuse: 'Reutilizar',
  recycling: 'Reciclar',
};

type RecentAction = CircularActionRegistration & { title: string };

export default function CircularActionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 980;
  const [selectedId, setSelectedId] = useState(circularActions[0]?.id ?? '');
  const [hasPhotoEvidence, setHasPhotoEvidence] = useState(false);
  const [progress, setProgress] = useState<CircularChallengeProgress>({ xp: 0, participationCount: 0, missionTarget: 4 });
  const [recent, setRecent] = useState<RecentAction[]>([]);
  const selected = useMemo(
    () => circularActions.find((action) => action.id === selectedId) ?? circularActions[0],
    [selectedId],
  );

  const submit = () => {
    if (!selected) return;
    const registration = registerCircularAction(selected, hasPhotoEvidence, progress);
    setProgress(registration);
    setRecent((current) => [{ ...registration, title: selected.title }, ...current].slice(0, 3));
    setHasPhotoEvidence(false);
  };

  const missionProgress = circularMissionProgress(progress);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenScroll contentContainerStyle={styles.screen}>
        <View style={styles.topbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio de sesión" onPress={() => router.replace('/sign-in')} style={styles.backLink}>
            <ChevronLeft size={18} color={colors.textMuted} />
            <AppText variant="bodyStrong" style={{ color: colors.textMuted }}>Volver</AppText>
          </Pressable>
          <Pill label="Demo autónoma · sin QR" tone="positive" />
        </View>

        <View style={[styles.hero, { backgroundColor: colors.surfaceStrong }]}>
          <View style={styles.heroCopy}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}><Recycle size={29} color="#17351B" strokeWidth={2.6} /></View>
            <AppText variant="eyebrow" style={{ color: colors.primary }}>Reto Acción Circular</AppText>
            <AppText variant="display" style={[styles.heroTitle, { color: colors.textOnStrong }]}>Haz que algo no se convierta en residuo.</AppText>
            <AppText style={[styles.heroDescription, { color: colors.textOnStrong }]}>Elige una acción, sigue una guía breve y registra tu participación desde acá. No necesitas escanear un QR ni conectarte a infraestructura externa.</AppText>
          </View>
          <View style={[styles.heroPromise, { borderColor: `${colors.primary}55` }]}>
            <ShieldCheck size={23} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong" style={{ color: colors.textOnStrong }}>Impacto honesto</AppText>
              <AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.68 }}>Tu acción suma participación y XP. Sin medición verificable, no inventamos kilos ni CO₂.</AppText>
            </View>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <MetricCard icon={Sparkles} label="XP social" value={`${progress.xp}`} detail="Reconoce tu participación" />
          <MetricCard icon={Users} label="Acciones registradas" value={`${progress.participationCount}`} detail={`Meta personal: ${progress.missionTarget}`} />
          <MetricCard icon={CircleGauge} label="Impacto material" value="Sin dato confirmado" detail="No equivale a kg o CO₂" compactValue />
        </View>

        <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={styles.catalogColumn}>
            <View style={styles.sectionHeading}>
              <View style={{ gap: 3 }}>
                <AppText variant="eyebrow" style={{ color: colors.primary }}>Paso 1</AppText>
                <AppText variant="h2">¿Qué acción hiciste?</AppText>
              </View>
              <AppText variant="caption" style={{ color: colors.textMuted }}>Prevenir suma más XP que reciclar</AppText>
            </View>

            <View style={styles.actionGrid}>
              {circularActions.map((action) => (
                <ActionOption
                  key={action.id}
                  action={action}
                  selected={action.id === selectedId}
                  onPress={() => setSelectedId(action.id)}
                />
              ))}
            </View>
          </View>

          <Card style={styles.registrationCard}>
            <View style={{ gap: 4 }}>
              <AppText variant="eyebrow" style={{ color: colors.primary }}>Paso 2</AppText>
              <AppText variant="h2">Registra tu acción</AppText>
            </View>

            {selected && <View style={[styles.selectedSummary, { backgroundColor: colors.surfaceMuted }]}>
              <View style={[styles.selectedIcon, { backgroundColor: colors.environmentalSoft }]}>
                {(() => { const Icon = actionIcons[selected.icon]; return <Icon size={25} color={colors.environmental} />; })()}
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <AppText variant="bodyStrong">{selected.title}</AppText>
                <AppText variant="caption" style={{ color: colors.textMuted }}>{selected.guidance}</AppText>
              </View>
              <Pill label={`+${pointsForCircularAction(selected.kind)} XP`} tone="primary" />
            </View>}

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: hasPhotoEvidence }}
              onPress={() => setHasPhotoEvidence((value) => !value)}
              style={({ pressed }) => [styles.evidenceToggle, { borderColor: hasPhotoEvidence ? colors.primary : colors.border, backgroundColor: hasPhotoEvidence ? colors.environmentalSoft : colors.surface, opacity: pressed ? 0.82 : 1 }]}
            >
              <View style={[styles.checkbox, { borderColor: hasPhotoEvidence ? colors.primary : colors.borderStrong, backgroundColor: hasPhotoEvidence ? colors.primary : 'transparent' }]}>
                {hasPhotoEvidence && <Check size={15} color="#17351B" strokeWidth={3} />}
              </View>
              <Camera size={20} color={hasPhotoEvidence ? colors.environmental : colors.textMuted} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">Adjuntar evidencia opcional</AppText>
                <AppText variant="caption" style={{ color: colors.textMuted }}>En esta demo simula una foto; respalda la participación, no mide impacto.</AppText>
              </View>
            </Pressable>

            <Button label="Registrar acción" icon={ArrowRight} onPress={submit} disabled={!selected} />

            {recent[0] && <View accessibilityRole="alert" style={[styles.success, { backgroundColor: colors.environmentalSoft }]}>
              <Check size={19} color={colors.environmental} strokeWidth={3} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">¡Acción registrada!</AppText>
                <AppText variant="caption" style={{ color: colors.textMuted }}>{recent[0].title} · +{recent[0].awardedXp} XP · {recent[0].evidenceStatus === 'photo-attached' ? 'foto adjunta en demo' : 'declarada por ti'}</AppText>
              </View>
            </View>}
          </Card>
        </View>

        <Card style={styles.missionCard}>
          <View style={styles.missionTop}>
            <View style={{ flex: 1, gap: 5 }}>
              <AppText variant="eyebrow" style={{ color: colors.primary }}>Misión personal de hoy</AppText>
              <AppText variant="h2">Completa 4 acciones circulares</AppText>
              <AppText style={{ color: colors.textMuted }}>Cada registro mueve la meta. La evidencia visual es opcional.</AppText>
            </View>
            <View style={[styles.missionCount, { backgroundColor: colors.surfaceStrong }]}>
              <AppText variant="metric" style={{ color: colors.textOnStrong }}>{progress.participationCount}/{progress.missionTarget}</AppText>
            </View>
          </View>
          <ProgressBar value={missionProgress} accessibilityLabel="Progreso de misión circular" />
          <View style={styles.legend}>
            <LegendDot color={colors.primary} label="XP: incentivo social" />
            <LegendDot color={colors.environmental} label="Participación: acción declarada" />
            <LegendDot color={colors.borderStrong} label="Impacto físico: por confirmar" />
          </View>
        </Card>
      </ScreenScroll>
    </View>
  );
}

function MetricCard({ icon: Icon, label, value, detail, compactValue = false }: { icon: LucideIcon; label: string; value: string; detail: string; compactValue?: boolean }) {
  const { colors } = useTheme();
  return <Card style={styles.metricCard}>
    <View style={[styles.metricIcon, { backgroundColor: colors.environmentalSoft }]}><Icon size={20} color={colors.environmental} /></View>
    <View style={{ gap: 3 }}>
      <AppText variant="caption" style={{ color: colors.textMuted }}>{label}</AppText>
      <AppText variant={compactValue ? 'h3' : 'metric'}>{value}</AppText>
      <AppText variant="caption" style={{ color: colors.textMuted }}>{detail}</AppText>
    </View>
  </Card>;
}

function ActionOption({ action, selected, onPress }: { action: CircularActionDefinition; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const Icon = actionIcons[action.icon];
  return <Pressable
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={`${action.title}, ${pointsForCircularAction(action.kind)} XP`}
    onPress={onPress}
    style={({ pressed }) => [styles.actionOption, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.environmentalSoft : colors.surface, opacity: pressed ? 0.82 : 1 }]}
  >
    <View style={styles.actionTop}>
      <View style={[styles.actionIcon, { backgroundColor: selected ? colors.primary : colors.surfaceMuted }]}><Icon size={23} color={selected ? '#17351B' : colors.textMuted} /></View>
      <Pill label={kindLabels[action.kind]} tone={selected ? 'primary' : 'neutral'} />
    </View>
    <View style={{ gap: 5 }}>
      <AppText variant="h3">{action.title}</AppText>
      <AppText variant="caption" style={{ color: colors.textMuted }}>{action.description}</AppText>
    </View>
    <AppText variant="bodyStrong" style={{ color: colors.environmental }}>+{pointsForCircularAction(action.kind)} XP</AppText>
  </Pressable>;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: color }]} /><AppText variant="caption" style={{ color: colors.textMuted }}>{label}</AppText></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { width: '100%', maxWidth: 1220, alignSelf: 'center', paddingTop: spacing.xl, paddingBottom: 70, gap: spacing.xxl },
  topbar: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  backLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 },
  hero: { borderRadius: radius.xl, padding: spacing.xxxl, gap: spacing.xxl },
  heroCopy: { maxWidth: 800, gap: spacing.md },
  heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  heroTitle: { maxWidth: 760 },
  heroDescription: { opacity: 0.75, maxWidth: 740, fontSize: 17, lineHeight: 25 },
  heroPromise: { maxWidth: 650, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: { flex: 1, minWidth: 220, minHeight: 138, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  metricIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  columns: { gap: spacing.xxl },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  catalogColumn: { flex: 1.25, minWidth: 0, gap: spacing.lg },
  registrationCard: { flex: 0.75, minWidth: 320, gap: spacing.lg },
  sectionHeading: { gap: spacing.sm },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionOption: { width: '48%', minWidth: 240, flexGrow: 1, minHeight: 210, borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.lg, justifyContent: 'space-between', gap: spacing.lg },
  actionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  actionIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  selectedSummary: { borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  selectedIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  evidenceToggle: { minHeight: 88, borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  success: { borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  missionCard: { gap: spacing.xl },
  missionTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  missionCount: { minWidth: 96, minHeight: 78, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 9, height: 9, borderRadius: 5 },
});
