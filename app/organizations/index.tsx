import { Check, Clock3, Plus, RefreshCw, ShieldCheck, UsersRound, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/auth/AppAuthProvider';
import { AppText, Button, Card, CommunityAvatar, EmptyState, Pill, ScreenScroll, SectionHeader } from '@/design/components';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import { useOrganizations } from '@/features/organizations/OrganizationProvider';
import { AppShell } from '@/navigation/AppShell';

export default function OrganizationsScreen() {
  const { colors } = useTheme();
  const auth = useAppAuth();
  const router = useRouter();
  const store = useOrganizations();
  const [workingId, setWorkingId] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const ownMemberships = useMemo(() => store.memberships.filter((membership) => membership.user_id === auth.user?.id), [auth.user?.id, store.memberships]);
  const adminOrganizationIds = new Set(ownMemberships.filter((membership) => membership.role === 'owner' || membership.role === 'admin').map((membership) => membership.organization_id));
  const pendingReviews = store.requests.filter((request) => request.status === 'pending' && request.user_id !== auth.user?.id && adminOrganizationIds.has(request.organization_id));

  const run = async (id: string, action: () => Promise<void>) => {
    setWorkingId(id);
    setActionError(undefined);
    try { await action(); } catch (caught) { setActionError(caught instanceof Error ? caught.message : 'No pudimos completar la acción.'); } finally { setWorkingId(undefined); }
  };

  return <AppShell><ScreenScroll contentContainerStyle={styles.screen}>
    <View style={styles.header}><View style={styles.title}><AppText variant="eyebrow" style={{ color: colors.primary }}>Equipos con identidad propia</AppText><AppText variant="h1">Organizaciones</AppText><AppText style={{ color: colors.textMuted }}>Puedes pertenecer a varias. Cada solicitud debe ser aprobada por un owner o admin.</AppText></View><Button label="Crear" icon={Plus} compact onPress={() => router.push('/organization/create' as never)} /></View>
    {(store.error || actionError) && <View style={[styles.message, { backgroundColor: colors.dangerSoft }]} accessibilityRole="alert"><AppText variant="caption" style={{ color: colors.danger }}>{actionError ?? store.error}</AppText><Button label="Reintentar" icon={RefreshCw} compact variant="ghost" onPress={() => void store.refresh()} /></View>}

    <View style={styles.section}><SectionHeader title="Disponibles" actionLabel={`${ownMemberships.length} tuyas`} />
      {store.organizations.length ? <View style={styles.grid}>{store.organizations.map((organization) => {
        const membership = ownMemberships.find((item) => item.organization_id === organization.id);
        const request = store.requests.find((item) => item.organization_id === organization.id && item.user_id === auth.user?.id);
        const initials = organization.name.split(/\s+/).slice(0, 3).map((part) => part[0]).join('').toUpperCase();
        return <Card key={organization.id} style={styles.organizationCard}>
          <View style={styles.identity}><CommunityAvatar initials={initials} color={organization.accent} /><View style={{ flex: 1, gap: 4 }}><AppText variant="h3">{organization.name}</AppText>{membership && <Pill label={roleLabel(membership.role)} tone="positive" />}{!membership && request?.status === 'pending' && <Pill label="Solicitud pendiente" tone="primary" />}</View></View>
          <AppText style={{ color: colors.textMuted }}>{organization.description}</AppText>
          {membership ? <View style={styles.memberState}><Check size={17} color={colors.environmental} /><AppText variant="caption" style={{ color: colors.environmental }}>Ya perteneces a esta organización</AppText></View> : <Button label={request?.status === 'pending' ? 'Solicitud enviada' : request?.status === 'rejected' ? 'Volver a solicitar' : 'Solicitar unirme'} icon={request?.status === 'pending' ? Clock3 : UsersRound} variant="secondary" disabled={request?.status === 'pending'} loading={workingId === organization.id} onPress={() => void run(organization.id, () => store.requestJoin(organization.id))} />}
        </Card>;
      })}</View> : !store.loading && <EmptyState title="Aún no hay organizaciones" detail="Crea la primera organización para comenzar a reunir integrantes." icon={UsersRound} action={<Button label="Crear organización" onPress={() => router.push('/organization/create' as never)} />} />}
    </View>

    {pendingReviews.length > 0 && <View style={styles.section}><SectionHeader title="Solicitudes por revisar" actionLabel={`${pendingReviews.length} pendientes`} />
      <Card style={styles.requests}>{pendingReviews.map((request) => {
        const organization = store.organizations.find((item) => item.id === request.organization_id);
        return <View key={request.id} style={[styles.request, { borderBottomColor: colors.border }]}><View style={{ flex: 1, gap: 3 }}><AppText variant="bodyStrong">{request.requesterName}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>Solicita unirse a {organization?.name ?? 'tu organización'}</AppText></View><Button label="Rechazar" icon={X} variant="ghost" compact loading={workingId === `${request.id}-reject`} onPress={() => void run(`${request.id}-reject`, () => store.reviewRequest(request.id, 'rejected'))} /><Button label="Aceptar" icon={ShieldCheck} compact loading={workingId === request.id} onPress={() => void run(request.id, () => store.reviewRequest(request.id, 'accepted'))} /></View>;
      })}</Card>
    </View>}
  </ScreenScroll></AppShell>;
}

function roleLabel(role: 'member' | 'admin' | 'owner') {
  return role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Integrante';
}

const styles = StyleSheet.create({
  screen: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingTop: 22 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg },
  title: { flex: 1, minWidth: 280, gap: spacing.sm },
  section: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  organizationCard: { flexGrow: 1, flexBasis: 300, maxWidth: 520, gap: spacing.lg },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  memberState: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  message: { padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  requests: { paddingVertical: spacing.sm },
  request: { minHeight: 72, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: 1 },
});
