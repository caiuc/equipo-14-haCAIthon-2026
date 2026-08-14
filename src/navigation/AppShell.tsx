import { Home, Plus, Trophy, UserRound, UsersRound } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, SafeAreaView, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { AppText } from '@/design/components';
import { RetornaLogo, RetornaMark } from '@/design/Logo';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';

const navItems: { label: string; path: '/home' | '/communities' | '/recycle' | '/leaderboards' | '/profile'; icon: LucideIcon }[] = [
  { label: 'Inicio', path: '/home', icon: Home },
  { label: 'Comunidades', path: '/communities', icon: UsersRound },
  { label: 'Reciclar', path: '/recycle', icon: Plus },
  { label: 'Ranking', path: '/leaderboards', icon: Trophy },
  { label: 'Perfil', path: '/profile', icon: UserRound },
];

export function AppShell({ children }: React.PropsWithChildren) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.root}>
        {desktop && <DesktopNav />}
        <View style={styles.content}>{children}</View>
        {!desktop && <MobileNav />}
      </View>
    </SafeAreaView>
  );
}

function DesktopNav() {
  const { colors } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <View style={[styles.desktopNav, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <RetornaLogo />
      <View style={styles.desktopLinks}>
        {navItems.map((item) => {
          const active = pathIsActive(pathname, item.path);
          const Icon = item.icon;
          return (
            <Pressable key={item.path} onPress={() => router.push(item.path)} accessibilityRole="link" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.desktopLink, active && { backgroundColor: colors.surfaceMuted }, pressed && { opacity: 0.7 }]}>
              <Icon size={21} color={active ? colors.primary : colors.textMuted} strokeWidth={active ? 2.7 : 2} />
              <AppText variant="bodyStrong" style={{ color: active ? colors.text : colors.textMuted }}>{item.label}</AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.pucPill, { backgroundColor: colors.surfaceStrong }]}>
        <AppText variant="eyebrow" style={{ color: colors.textOnStrong }}>Comunidad UC</AppText>
        <AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.7 }}>Chile · Beta MVP</AppText>
      </View>
    </View>
  );
}

function MobileNav() {
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <View style={[styles.mobileNav, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: isDark ? '#000' : '#101B2D' }]}>
      {navItems.map((item) => {
        const active = pathIsActive(pathname, item.path);
        const Icon = item.icon;
        const primary = item.path === '/recycle';
        return (
          <Pressable key={item.path} onPress={() => router.push(item.path)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.mobileLink, primary && styles.primaryMobileLink, pressed && { opacity: 0.72 }]}>
            {primary ? (
              <View style={[styles.recycleButton, { backgroundColor: colors.primary }]}><Icon size={26} color="#FFFFFF" strokeWidth={2.7} /></View>
            ) : <Icon size={21} color={active ? colors.primary : colors.textMuted} strokeWidth={active ? 2.7 : 2} />}
            <AppText variant="caption" style={{ fontSize: 10, color: primary || active ? colors.text : colors.textMuted }}>{item.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function pathIsActive(pathname: string, path: string) {
  if (path === '/home') return pathname === '/home';
  if (path === '/communities') return pathname.startsWith('/communit');
  if (path === '/recycle') return pathname.startsWith('/recycle') || pathname.startsWith('/scanner');
  if (path === '/leaderboards') return pathname.startsWith('/leaderboard');
  return pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/share-card');
}

export function PublicHeader() {
  const { colors } = useTheme();
  return <View style={[styles.publicHeader, { borderBottomColor: colors.border }]}><RetornaMark /><AppText variant="logo">retorna</AppText></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1, flexDirection: 'row' },
  content: { flex: 1, minWidth: 0 },
  desktopNav: { width: 238, borderRightWidth: 1, padding: 24, paddingTop: 28, gap: 36 },
  desktopLinks: { gap: 7, flex: 1 },
  desktopLink: { minHeight: 48, borderRadius: radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pucPill: { borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  mobileNav: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 78, borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingBottom: Platform.OS === 'ios' ? 12 : 5,
    ...Platform.select({ ios: { shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: -4 } }, android: { elevation: 16 }, web: { boxShadow: '0 -10px 30px rgba(16,27,45,.08)' } as ViewStyle }),
  },
  mobileLink: { flex: 1, height: 58, minWidth: 54, alignItems: 'center', justifyContent: 'center', gap: 4 },
  primaryMobileLink: { marginTop: -23 },
  recycleButton: { width: 53, height: 53, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  publicHeader: { height: 72, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, gap: 9 },
});
