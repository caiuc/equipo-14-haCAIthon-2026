import { Building2, Globe2, GraduationCap, Map, UserRound, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/design/components';
import { RetornaLogo } from '@/design/Logo';
import { spacing } from '@/design/tokens';
import { useTheme } from '@/design/theme';

const levels: { label: string; icon: LucideIcon }[] = [
  { label: 'Tú', icon: UserRound },
  { label: 'Campus', icon: GraduationCap },
  { label: 'Ciudad', icon: Building2 },
  { label: 'Región', icon: Map },
  { label: 'Planeta', icon: Globe2 },
];

export function AuthScaleHero() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= 840;
  const fontSizes = desktop ? [42, 57, 75, 94, 112] : [34, 43, 53, 63, 73];
  const iconSizes = desktop ? [24, 30, 38, 48, 58] : [20, 24, 28, 33, 39];

  return <View style={[styles.hero, { backgroundColor: colors.surfaceStrong }]}>
    <RetornaLogo inverted />
    <View style={styles.scale} accessibilityLabel="Tu impacto crece desde ti hasta el planeta">
      {levels.map(({ label, icon: Icon }, index) => <View key={label} style={styles.level}>
        <AppText numberOfLines={1} style={[styles.word, { color: colors.textOnStrong, fontSize: fontSizes[index], lineHeight: Math.round(fontSizes[index]! * 0.94) }]}>{label}</AppText>
        <Icon color={colors.primary} size={iconSizes[index]} strokeWidth={1.7} />
      </View>)}
    </View>
    <AppText style={[styles.footer, { color: colors.textOnStrong }]}>Un gesto individual puede mover una comunidad completa.</AppText>
  </View>;
}

const styles = StyleSheet.create({
  hero: { flex: 1.12, minHeight: 500, padding: spacing.xxxl, justifyContent: 'space-between', overflow: 'hidden' },
  scale: { width: '100%', maxWidth: 590, gap: 1 },
  level: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  word: { fontWeight: '900', letterSpacing: -3.2 },
  footer: { maxWidth: 390, opacity: 0.72, fontSize: 15 },
});
