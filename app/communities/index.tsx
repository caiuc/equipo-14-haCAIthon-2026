import { Plus, Search, Sparkles, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Button, EmptyState, ScreenScroll, SectionHeader } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { CommunityCard } from '@/features/communities/components';
import { AppShell } from '@/navigation/AppShell';

export default function CommunitiesScreen() {
  const { colors } = useTheme();
  const { state, joinedCommunities } = useRetornaStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => state.communities.filter((item) => `${item.name} ${item.description} ${item.tags.join(' ')}`.toLocaleLowerCase('es-CL').includes(query.toLocaleLowerCase('es-CL'))), [query, state.communities]);
  const joinedIds = new Set(joinedCommunities.map((item) => item.id));
  const discover = filtered.filter((item) => !joinedIds.has(item.id));
  return (
    <AppShell>
      <ScreenScroll contentContainerStyle={styles.screen}>
        <View style={styles.header}><View style={{ flex: 1, gap: 6 }}><AppText variant="eyebrow" style={{ color: colors.primary }}>Competimos mejor en equipo</AppText><AppText variant="h1">Comunidades</AppText><AppText style={{ color: colors.textMuted }}>Encuentra tu facultad, campus o grupo. Cada aporte mueve un ranking distinto.</AppText></View><Button label="Crear" icon={Plus} compact onPress={() => router.push('/community/create')} /></View>
        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><Search size={19} color={colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar facultad, campus o grupo" placeholderTextColor={colors.textMuted} style={[styles.searchInput, { color: colors.text }]} accessibilityLabel="Buscar comunidades" /></View>

        {!query && <View style={styles.section}><SectionHeader title="Tus comunidades" actionLabel={`${joinedCommunities.length} activas`} />{joinedCommunities.length ? <ScrollView horizontal={width < 900} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.communityGrid, width >= 900 && styles.communityGridDesktop]}>{joinedCommunities.map((community) => <View key={community.id} style={width >= 900 ? styles.gridItem : undefined}><CommunityCard community={community} state={state} variant="feature" /></View>)}</ScrollView> : <EmptyState icon={UsersRound} title="Tu reciclaje llega más lejos en equipo." detail="Explora comunidades UC o crea una con tus amistades." action={<Button label="Explorar comunidades" onPress={() => undefined} />} />}</View>}

        <View style={styles.section}><SectionHeader title={query ? `Resultados (${filtered.length})` : 'En movimiento ahora'} actionLabel={!query ? 'Ranking completo' : undefined} onAction={() => router.push('/leaderboards')} />{discover.length || query ? <View style={[styles.communityGrid, width >= 700 && styles.communityGridDesktop]}>{(query ? filtered : discover).map((community) => <View key={community.id} style={width >= 700 ? styles.gridItem : undefined}><CommunityCard community={community} state={state} /></View>)}</View> : <EmptyState title="No encontramos esa comunidad" detail="Prueba con el nombre de una facultad, campus o agrupación." icon={Search} />}</View>

        {!query && <View style={[styles.invite, { backgroundColor: colors.surfaceStrong }]}><View style={[styles.inviteIcon, { backgroundColor: colors.environmental }]}><Sparkles color="#FFFFFF" /></View><View style={{ flex: 1 }}><AppText variant="h3" style={{ color: colors.textOnStrong }}>¿Tienes un código privado?</AppText><AppText style={{ color: colors.textOnStrong, opacity: 0.68 }}>Úsalo para entrar al grupo de tu clase, club o amistades.</AppText></View><Button label="Ingresar código" variant="secondary" compact /></View>}
      </ScreenScroll>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screen: { maxWidth: 1120, width: '100%', alignSelf: 'center', paddingTop: 24 },
  header: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  search: { minHeight: 54, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchInput: { flex: 1, fontSize: 16, outlineStyle: 'none' } as never,
  section: { gap: spacing.md },
  communityGrid: { gap: spacing.md },
  communityGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '48.8%', minWidth: 310 },
  invite: { borderRadius: radius.lg, padding: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  inviteIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
