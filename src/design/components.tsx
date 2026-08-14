import type { LucideIcon } from 'lucide-react-native';
import {
  BatteryMedium,
  Box,
  Cpu,
  CupSoda,
  FileText,
  GlassWater,
  Milk,
  Recycle,
  Sparkles,
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import type { RecyclingCategory } from '@/domain/types';
import { radius, spacing } from './tokens';
import { useTheme } from './theme';

type TextVariant = 'logo' | 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'caption' | 'eyebrow' | 'metric';

const textVariants: Record<TextVariant, TextStyle> = {
  logo: { fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1.5 },
  display: { fontSize: 38, lineHeight: 41, fontWeight: '900', letterSpacing: -1.7 },
  h1: { fontSize: 30, lineHeight: 34, fontWeight: '900', letterSpacing: -1.1 },
  h2: { fontSize: 22, lineHeight: 27, fontWeight: '800', letterSpacing: -0.5 },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '800', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  eyebrow: { fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  metric: { fontSize: 27, lineHeight: 31, fontWeight: '900', letterSpacing: -1 },
};

export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: TextVariant }) {
  const { colors } = useTheme();
  return <Text {...props} style={[{ color: colors.text }, textVariants[variant], style]} />;
}

export function Card({ style, children, ...props }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled,
  loading,
  compact,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const backgrounds: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.surfaceMuted,
    ghost: 'transparent',
    danger: colors.dangerSoft,
    dark: colors.surfaceStrong,
  };
  const foregrounds: Record<ButtonVariant, string> = {
    primary: '#000000',
    secondary: colors.text,
    ghost: colors.text,
    danger: colors.danger,
    dark: colors.textOnStrong,
  };
  const foreground = foregrounds[variant];
  const border = variant === 'primary' ? colors.primary : colors.border;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: backgrounds[variant], opacity: disabled ? 0.45 : pressed ? 0.82 : 1, borderColor: border },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={foreground} /> : <>
        {Icon && <Icon size={compact ? 16 : 18} strokeWidth={2.4} color={foreground} />}
        <AppText variant="bodyStrong" style={{ color: foreground }}>{label}</AppText>
      </>}
    </Pressable>
  );
}

export function Avatar({ initials, color, size = 44, imageUrl }: { initials: string; color: string; size?: number; imageUrl?: string }) {
  const { colors } = useTheme();
  void color;
  void imageUrl;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary }]} accessibilityLabel={`Avatar ${initials}`}>
      <AppText variant={size > 52 ? 'h3' : 'caption'} style={{ color: '#000000' }}>{initials}</AppText>
    </View>
  );
}

export function CommunityAvatar({ initials, color, size = 48 }: { initials: string; color: string; size?: number }) {
  const { colors } = useTheme();
  void color;
  return (
    <View style={[styles.communityAvatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary }]}>
      <AppText variant={size > 52 ? 'h3' : 'caption'} style={{ color: '#000000', fontWeight: '900' }}>{initials}</AppText>
    </View>
  );
}

export function ProgressBar({ value, color, height = 9, accessibilityLabel }: { value: number; color?: string; height?: number; accessibilityLabel?: string }) {
  const { colors } = useTheme();
  void color;
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }} accessibilityLabel={accessibilityLabel} style={[styles.progressTrack, { height, backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      <View style={{ height: '100%', width: `${Math.max(2, Math.min(100, value))}%`, backgroundColor: colors.primary, borderRadius: radius.pill }} />
    </View>
  );
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'primary' | 'positive' | 'dark' }) {
  const { colors } = useTheme();
  const highlighted = tone === 'primary' || tone === 'positive';
  const background = highlighted ? colors.primary : tone === 'dark' ? colors.surfaceStrong : colors.surface;
  const foreground = highlighted ? '#000000' : tone === 'dark' ? colors.textOnStrong : colors.text;
  return <View style={[styles.pill, { backgroundColor: background, borderColor: highlighted ? colors.primary : colors.border }]}><AppText variant="caption" style={{ color: foreground }}>{label}</AppText></View>;
}

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="h2">{title}</AppText>
      {actionLabel && <Pressable onPress={onAction} accessibilityRole="button"><AppText variant="bodyStrong" style={{ color: colors.primary }}>{actionLabel}</AppText></Pressable>}
    </View>
  );
}

export function SegmentedControl<T extends string>({ values, selected, onChange }: { values: { value: T; label: string }[]; selected: T; onChange: (value: T) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {values.map((item) => {
        const active = item.value === selected;
        return (
          <Pressable key={item.value} onPress={() => onChange(item.value)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={[styles.segment, active && { backgroundColor: colors.primary }]}>
            <AppText variant="caption" style={{ color: active ? '#000000' : colors.text }}>{item.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ScreenScroll({ children, contentContainerStyle, ...props }: React.ComponentProps<typeof ScrollView>) {
  return <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} {...props} contentContainerStyle={[styles.screenContent, contentContainerStyle]}>{children}</ScrollView>;
}

export function EmptyState({ title, detail, icon: Icon = Sparkles, action }: { title: string; detail: string; icon?: LucideIcon; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Card style={styles.emptyState}>
      <View style={styles.emptyIcon}><Icon color={colors.environmental} size={32} /></View>
      <AppText variant="h3" style={{ textAlign: 'center' }}>{title}</AppText>
      <AppText style={{ color: colors.textMuted, textAlign: 'center', maxWidth: 380 }}>{detail}</AppText>
      {action}
    </Card>
  );
}

const categoryIcons: Record<RecyclingCategory['icon'], LucideIcon> = {
  bottle: CupSoda,
  glass: GlassWater,
  can: Recycle,
  paper: FileText,
  box: Box,
  carton: Milk,
  cpu: Cpu,
  battery: BatteryMedium,
  recycle: Recycle,
};

export function CategoryBadge({ category, selected = false, onPress }: { category: RecyclingCategory; selected?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  const Icon = categoryIcons[category.icon];
  return (
    <Pressable onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityState={{ selected }} style={[styles.categoryBadge, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface }]}>
      <View style={styles.categoryIcon}><Icon size={28} color={selected ? '#000000' : colors.primary} strokeWidth={2.2} /></View>
      <AppText variant="caption" numberOfLines={2} style={{ textAlign: 'center', color: selected ? '#000000' : colors.text }}>{category.shortName}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  button: { minHeight: 48, borderRadius: radius.md, paddingHorizontal: spacing.xl, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  buttonCompact: { minHeight: 38, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  communityAvatar: { alignItems: 'center', justifyContent: 'center' },
  progressTrack: { overflow: 'hidden', borderRadius: radius.pill, width: '100%', borderWidth: 1 },
  pill: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  segmented: { padding: 4, borderRadius: radius.md, flexDirection: 'row', alignSelf: 'stretch', borderWidth: 1 },
  segment: { flex: 1, minHeight: 38, paddingHorizontal: 8, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  screenContent: { padding: spacing.lg, paddingBottom: 112, gap: spacing.xl },
  emptyState: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl },
  emptyIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  categoryBadge: { width: 88, minHeight: 100, borderWidth: 1.5, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  categoryIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
