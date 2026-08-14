import { Building2, CalendarDays, LogOut, Mail, MapPin, Plus, ShieldCheck, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/auth/AppAuthProvider';
import { useRetornaStore } from '@/data/store';
import { AppText, Avatar, Button, Card, CommunityAvatar, EmptyState, Pill, ScreenScroll, SectionHeader } from '@/design/components';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import { useOrganizations } from '@/features/organizations/OrganizationProvider';
import { AppShell } from '@/navigation/AppShell';

export default function ProfileRoute() {
  const { colors } = useTheme();
  const auth = useAppAuth();
  const { state } = useRetornaStore();
  const organizations = useOrganizations();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string>();
  const memberships = useMemo(() => organizations.memberships.filter((item) => item.user_id === auth.user?.id), [auth.user?.id, organizations.memberships]);
  const joined = memberships.map((membership) => ({ membership, organization: organizations.organizations.find((item) => item.id === membership.organization_id) })).filter((item) => item.organization !== undefined);
  const canManage = memberships.some((membership) => membership.role === 'owner' || membership.role === 'admin');
  const demoProfile = state.profiles.find((item) => item.id === state.currentUserId);
  const profile = auth.profile ?? (auth.isDemoMode && demoProfile ? {
    id: demoProfile.id,
    username: demoProfile.username,
    display_name: demoProfile.displayName,
    initials: demoProfile.initials,
    avatar_color: demoProfile.avatarColor,
    bio: demoProfile.bio ?? null,
    affiliation: demoProfile.affiliation ?? null,
    campus: demoProfile.campus ?? null,
    created_at: demoProfile.createdAt,
  } : null);

  const logout = async () => {
    setLoggingOut(true);
    setError(undefined);
    try {
      await auth.signOut();
      router.replace('/sign-in');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos cerrar la sesión.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (!profile) return <AppShell><View style={styles.center}><AppText variant="h2">Cargando tu perfil…</AppText></View></AppShell>;

  return <AppShell><ScreenScroll contentContainerStyle={styles.screen}>
    <Card style={styles.identityCard}>
      <Avatar initials={profile.initials} color={profile.avatar_color} size={78} />
      <View style={styles.identityText}><AppText variant="h1">{profile.display_name}</AppText><AppText variant="bodyStrong" style={{ color: colors.primary }}>@{profile.username}</AppText>{profile.bio && <AppText style={{ color: colors.textMuted }}>{profile.bio}</AppText>}</View>
      <Pill label={auth.isDemoMode ? 'Perfil demo' : 'Cuenta activa'} tone="positive" />
    </Card>

    <View style={styles.columns}>
      <View style={styles.mainColumn}>
        <View style={styles.section}><SectionHeader title="Información de tu cuenta" /><Card style={styles.details}>
          <Detail icon={Mail} label="Correo" value={auth.identityEmail ?? auth.user?.email ?? 'Sin correo disponible'} />
          {profile.affiliation && <Detail icon={Building2} label="Afiliación" value={profile.affiliation} />}
          {profile.campus && <Detail icon={MapPin} label="Campus" value={profile.campus} />}
          <Detail icon={CalendarDays} label="En Retorna desde" value={new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(profile.created_at))} />
        </Card></View>

        <View style={styles.section}><SectionHeader title="Tus organizaciones" actionLabel="Ver todas" onAction={() => router.push('/organizations' as never)} />
          {joined.length ? <View style={styles.organizationList}>{joined.map(({ membership, organization }) => organization && <Card key={membership.id} style={styles.organization}>
            <CommunityAvatar initials={organization.name.split(/\s+/).slice(0, 3).map((part) => part[0]).join('').toUpperCase()} color={organization.accent} />
            <View style={{ flex: 1, gap: 3 }}><AppText variant="bodyStrong">{organization.name}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>Te uniste el {new Intl.DateTimeFormat('es-CL').format(new Date(membership.joined_at))}</AppText></View>
            <Pill label={roleLabel(membership.role)} tone="positive" />
          </Card>)}</View> : !organizations.loading && <EmptyState icon={UsersRound} title="Aún no perteneces a organizaciones" detail="Explora las disponibles y envía una solicitud para unirte." action={<Button label="Explorar organizaciones" onPress={() => router.push('/organizations' as never)} />} />}
        </View>
      </View>

      <View style={styles.sideColumn}>
        <SectionHeader title="Lo que puedes hacer" />
        <Card style={styles.actions}>
          <Capability icon={UsersRound} title="Participar en varias organizaciones" detail="Solicita acceso y revisa el estado desde una sola vista." />
          <Capability icon={Plus} title="Crear una organización" detail="Al crearla quedas como owner automáticamente." />
          {canManage && <Capability icon={ShieldCheck} title="Gestionar solicitudes" detail="Como owner o admin puedes aceptar o rechazar ingresos." />}
          <Button label="Ver organizaciones" icon={Building2} onPress={() => router.push('/organizations' as never)} />
          <Button label="Crear organización" icon={Plus} variant="secondary" onPress={() => router.push('/organization/create' as never)} />
        </Card>
        {error && <View style={[styles.message, { backgroundColor: colors.dangerSoft }]} accessibilityRole="alert"><AppText variant="caption" style={{ color: colors.danger }}>{error}</AppText></View>}
        <Button label="Cerrar sesión" icon={LogOut} variant="danger" loading={loggingOut} onPress={() => void logout()} />
      </View>
    </View>
  </ScreenScroll></AppShell>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  const { colors } = useTheme();
  return <View style={styles.detail}><View style={styles.detailIcon}><Icon size={22} color={colors.primary} /></View><View style={{ flex: 1 }}><AppText variant="caption" style={{ color: colors.textMuted }}>{label}</AppText><AppText variant="bodyStrong">{value}</AppText></View></View>;
}

function Capability({ icon: Icon, title, detail }: { icon: typeof UsersRound; title: string; detail: string }) {
  const { colors } = useTheme();
  return <View style={styles.capability}><Icon size={20} color={colors.environmental} /><View style={{ flex: 1 }}><AppText variant="bodyStrong">{title}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>{detail}</AppText></View></View>;
}

function roleLabel(role: 'member' | 'admin' | 'owner') {
  return role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Integrante';
}

const styles = StyleSheet.create({
  screen: { maxWidth: 1080, width: '100%', alignSelf: 'center', paddingTop: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  identityCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl },
  identityText: { flex: 1, minWidth: 220, gap: 4 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, alignItems: 'flex-start' },
  mainColumn: { flex: 1.3, minWidth: 310, gap: spacing.xxl },
  sideColumn: { flex: 0.8, minWidth: 290, gap: spacing.md },
  section: { gap: spacing.md },
  details: { gap: spacing.lg },
  detail: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  organizationList: { gap: spacing.md },
  organization: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  actions: { gap: spacing.lg },
  capability: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  message: { padding: spacing.md },
});
