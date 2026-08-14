import { ArrowLeft, Check, LockKeyhole, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Button, Card, ScreenScroll } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import type { CommunityVisibility } from '@/domain/types';
import { AppShell } from '@/navigation/AppShell';

const LIME_ACCENT = '#7BCB3B';

export default function CreateCommunityScreen() {
  const { colors } = useTheme();
  const { createCommunity } = useRetornaStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<CommunityVisibility>('public');
  const submit = () => { const created = createCommunity({ name: name.trim(), description: description.trim(), visibility, accent: LIME_ACCENT }); router.replace({ pathname: '/community/[id]', params: { id: created.id } }); };
  return <AppShell><ScreenScroll contentContainerStyle={styles.screen}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surface }]}><ArrowLeft color={colors.text} /></Pressable><View style={{ flex: 1 }}><AppText variant="h1">Crea una comunidad</AppText><AppText style={{ color: colors.textMuted }}>Reúne a tu grupo en torno a una meta visible.</AppText></View></View>
    <Card style={styles.form}>
      <Field label="Nombre"><TextInput value={name} onChangeText={setName} maxLength={48} placeholder="Ej. Major Computación" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border }]} /></Field>
      <Field label="Descripción"><TextInput value={description} onChangeText={setDescription} maxLength={240} multiline placeholder="¿Qué une a esta comunidad?" placeholderTextColor={colors.textMuted} style={[styles.input, styles.multiline, { color: colors.text, borderColor: colors.border }]} /></Field>
      <Field label="Visibilidad"><View style={styles.visibility}>{([{ value: 'public', title: 'Pública', detail: 'Cualquier persona puede unirse.', icon: UsersRound }, { value: 'private', title: 'Privada', detail: 'Sólo con invitación o código.', icon: LockKeyhole }] as const).map((item) => { const Icon = item.icon; const active = visibility === item.value; return <Pressable key={item.value} onPress={() => setVisibility(item.value)} style={[styles.visibilityCard, { borderColor: active ? colors.primary : colors.border }]}><Icon color={active ? colors.primary : colors.textMuted} /><View style={{ flex: 1 }}><AppText variant="bodyStrong">{item.title}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>{item.detail}</AppText></View>{active && <Check color={colors.primary} />}</Pressable>; })}</View></Field>
      <Field label="Identidad visual"><View style={[styles.identity, { backgroundColor: colors.environmentalSoft }]}><View style={[styles.accent, { backgroundColor: LIME_ACCENT }]}><Check color="#000000" size={18} /></View><View style={{ flex: 1 }}><AppText variant="bodyStrong">Verde reciclaje</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>Todas las comunidades comparten la identidad de Retorna.</AppText></View></View></Field>
      <View style={[styles.notice, { backgroundColor: colors.environmentalSoft }]}><AppText variant="caption" style={{ color: colors.environmental }}>Serás propietario/a. Podrás invitar admins y gestionar desafíos desde la comunidad.</AppText></View>
      <Button label="Crear comunidad" onPress={submit} disabled={name.trim().length < 3 || description.trim().length < 12} />
    </Card>
  </ScreenScroll></AppShell>;
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) { return <View style={styles.field}><AppText variant="bodyStrong">{label}</AppText>{children}</View>; }

const styles = StyleSheet.create({
  screen: { maxWidth: 720, width: '100%', alignSelf: 'center', paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  form: { gap: spacing.xl },
  field: { gap: spacing.sm },
  input: { borderWidth: 1, minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 16, outlineStyle: 'none' } as never,
  multiline: { minHeight: 112, paddingTop: spacing.md, textAlignVertical: 'top' },
  visibility: { gap: spacing.md },
  visibilityCard: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md, padding: spacing.md },
  accent: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  notice: { borderRadius: radius.md, padding: spacing.md },
});
