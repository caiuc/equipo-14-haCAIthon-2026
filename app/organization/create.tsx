import { ArrowLeft, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { z } from 'zod';

import { AppText, Button, Card, ScreenScroll } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { useOrganizations } from '@/features/organizations/OrganizationProvider';
import { AppShell } from '@/navigation/AppShell';

const LIME_ACCENT = '#7BCB3B';
const organizationSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres.').max(80),
  description: z.string().trim().min(12, 'Describe la organización en al menos 12 caracteres.').max(500),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export default function CreateOrganizationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { createOrganization } = useOrganizations();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setError(undefined);
    const parsed = organizationSchema.safeParse({ name, description, accent: LIME_ACCENT });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos ingresados.');
      return;
    }
    setLoading(true);
    try {
      await createOrganization(parsed.data);
      router.replace('/organizations' as never);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos crear la organización.');
    } finally {
      setLoading(false);
    }
  };

  return <AppShell><ScreenScroll contentContainerStyle={styles.screen}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surface }]} accessibilityLabel="Volver"><ArrowLeft color={colors.text} /></Pressable><View style={{ flex: 1, gap: 4 }}><AppText variant="h1">Crea una organización</AppText><AppText style={{ color: colors.textMuted }}>Quedarás asociado automáticamente con rol owner.</AppText></View></View>
    <Card style={styles.form}>
      {error && <View style={[styles.message, { backgroundColor: colors.dangerSoft }]} accessibilityRole="alert"><AppText variant="caption" style={{ color: colors.danger }}>{error}</AppText></View>}
      <Field label="Nombre"><TextInput value={name} onChangeText={setName} maxLength={80} placeholder="Ej. Ingeniería Circular" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border }]} /></Field>
      <Field label="Descripción"><TextInput value={description} onChangeText={setDescription} maxLength={500} multiline placeholder="¿Cuál es el propósito de esta organización?" placeholderTextColor={colors.textMuted} style={[styles.input, styles.multiline, { color: colors.text, borderColor: colors.border }]} /></Field>
      <Field label="Identidad visual"><View style={[styles.identity, { backgroundColor: colors.environmentalSoft }]}><View style={[styles.accent, { backgroundColor: LIME_ACCENT }]}><Check color="#17351B" size={18} /></View><View style={{ flex: 1 }}><AppText variant="bodyStrong">Verde reciclaje</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>Todas las organizaciones comparten la identidad de Retorna.</AppText></View></View></Field>
      <Button label="Crear organización" onPress={() => void submit()} loading={loading} />
    </Card>
  </ScreenScroll></AppShell>;
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return <View style={styles.field}><AppText variant="bodyStrong">{label}</AppText>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { maxWidth: 720, width: '100%', alignSelf: 'center', paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  form: { gap: spacing.xl },
  field: { gap: spacing.sm },
  input: { borderWidth: 1, minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 16, outlineStyle: 'none' } as never,
  multiline: { minHeight: 112, paddingTop: spacing.md, textAlignVertical: 'top' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md, padding: spacing.md },
  accent: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  message: { borderRadius: radius.md, padding: spacing.md },
});
