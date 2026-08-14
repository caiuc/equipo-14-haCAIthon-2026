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

const accents = ['#FF6B4A', '#25A67A', '#2A7DE1', '#8F78C6', '#D55064', '#E09B2D'];

export default function CreateCommunityScreen() {
  const { colors } = useTheme();
  const { createCommunity } = useRetornaStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<CommunityVisibility>('public');
  const [accent, setAccent] = useState(accents[0]!);
  const submit = () => { const created = createCommunity({ name: name.trim(), description: description.trim(), visibility, accent }); router.replace({ pathname: '/community/[id]', params: { id: created.id } }); };
  return <AppShell><ScreenScroll contentContainerStyle={styles.screen}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surface }]}><ArrowLeft color={colors.text} /></Pressable><View style={{ flex: 1 }}><AppText variant="h1">Crea una comunidad</AppText><AppText style={{ color: colors.textMuted }}>Reúne a tu grupo en torno a una meta visible.</AppText></View></View>
    <Card style={styles.form}>
      <Field label="Nombre"><TextInput value={name} onChangeText={setName} maxLength={48} placeholder="Ej. Major Computación" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border }]} /></Field>
      <Field label="Descripción"><TextInput value={description} onChangeText={setDescription} maxLength={240} multiline placeholder="¿Qué une a esta comunidad?" placeholderTextColor={colors.textMuted} style={[styles.input, styles.multiline, { color: colors.text, borderColor: colors.border }]} /></Field>
      <Field label="Visibilidad"><View style={styles.visibility}>{([{ value: 'public', title: 'Pública', detail: 'Cualquier persona puede unirse.', icon: UsersRound }, { value: 'private', title: 'Privada', detail: 'Sólo con invitación o código.', icon: LockKeyhole }] as const).map((item) => { const Icon = item.icon; const active = visibility === item.value; return <Pressable key={item.value} onPress={() => setVisibility(item.value)} style={[styles.visibilityCard, { borderColor: active ? colors.primary : colors.border }]}><Icon color={active ? colors.primary : colors.textMuted} /><View style={{ flex: 1 }}><AppText variant="bodyStrong">{item.title}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>{item.detail}</AppText></View>{active && <Check color={colors.primary} />}</Pressable>; })}</View></Field>
      <Field label="Color de identidad"><View style={styles.accents}>{accents.map((item) => <Pressable key={item} onPress={() => setAccent(item)} style={[styles.accent, { backgroundColor: item }, accent === item && { borderColor: colors.text, borderWidth: 3 }]}>{accent === item && <Check color="#FFFFFF" size={18} />}</Pressable>)}</View></Field>
      <View style={[styles.notice, { backgroundColor: colors.environmentalSoft }]}><AppText variant="caption" style={{ color: colors.environmental }}>Serás propietario/a. Podrás invitar admins y gestionar desafíos desde la comunidad.</AppText></View>
      <Button label="Crear comunidad" onPress={submit} disabled={name.trim().length < 3 || description.trim().length < 12} />
    </Card>
  </ScreenScroll></AppShell>;
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) { return <View style={styles.field}><AppText variant="bodyStrong">{label}</AppText>{children}</View>; }

const styles = StyleSheet.create({
  screen: { maxWidth: 720, width: '100%', alignSelf: 'center', paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  back: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  form: { gap: spacing.xl },
  field: { gap: spacing.sm },
  input: { borderWidth: 1, minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 16, outlineStyle: 'none' } as never,
  multiline: { minHeight: 112, paddingTop: spacing.md, textAlignVertical: 'top' },
  visibility: { gap: spacing.md },
  visibilityCard: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  accents: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  accent: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  notice: { borderRadius: radius.md, padding: spacing.md },
});
