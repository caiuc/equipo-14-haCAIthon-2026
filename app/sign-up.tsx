import { ArrowLeft, ArrowRight, LockKeyhole, Mail, Play, UserRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { z } from 'zod';

import { useAppAuth } from '@/auth/AppAuthProvider';
import { AuthScaleHero } from '@/auth/AuthScaleHero';
import { AppText, Button } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';

const registrationSchema = z.object({
  displayName: z.string().trim().min(2, 'Ingresa tu nombre.').max(80, 'El nombre es demasiado largo.'),
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').max(72, 'La contraseña es demasiado larga.'),
});

export default function SignUpScreen() {
  const { colors } = useTheme();
  const auth = useAppAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 840;
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setError(undefined);
    const parsed = registrationSchema.safeParse({ displayName, email: email.trim(), password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos ingresados.');
      return;
    }
    setLoading(true);
    try {
      await auth.signUp(parsed.data);
      router.replace('/home');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const enterDemo = () => {
    auth.enterDemo();
    router.replace('/home');
  };

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={[styles.frame, desktop && styles.frameDesktop, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <AuthScaleHero />
        <View style={[styles.formSide, desktop && styles.formSideDesktop, { backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.replace('/sign-in')} style={styles.back} accessibilityLabel="Volver al inicio de sesión"><ArrowLeft color={colors.text} size={19} /><AppText variant="bodyStrong">Iniciar sesión</AppText></Pressable>
        <View style={styles.title}><AppText variant="eyebrow" style={{ color: colors.primary }}>Tu cuenta Retorna</AppText><AppText variant="h1">Crea tu cuenta</AppText><AppText style={{ color: colors.textMuted }}>Sólo necesitamos lo esencial para comenzar.</AppText></View>
        {auth.configurationError && <View style={[styles.message, { backgroundColor: colors.surfaceMuted }]}><AppText variant="caption" style={{ color: colors.textMuted }}>Supabase no está conectado. Aún puedes explorar la experiencia completa con el modo demo.</AppText></View>}
        {error && <Message text={error} />}
        <Field label="Nombre" icon={<UserRound size={18} color={colors.textMuted} />} value={displayName} onChangeText={setDisplayName} placeholder="Nombre y apellido" autoComplete="name" />
        <Field label="Correo" icon={<Mail size={18} color={colors.textMuted} />} value={email} onChangeText={setEmail} placeholder="nombre@uc.cl" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field label="Contraseña" icon={<LockKeyhole size={18} color={colors.textMuted} />} value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry autoComplete="new-password" />
        <Button label="Crear cuenta" icon={ArrowRight} onPress={() => void submit()} loading={loading} disabled={Boolean(auth.configurationError)} />
        <Button label="Entrar en modo demo" icon={Play} variant="secondary" onPress={enterDemo} />
        <AppText variant="caption" style={{ color: colors.textMuted, textAlign: 'center' }}>No pedimos confirmación adicional ni verificación de correo en este MVP.</AppText>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({ label, icon, ...props }: React.ComponentProps<typeof TextInput> & { label: string; icon: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={styles.field}><AppText variant="caption">{label}</AppText><View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>{icon}<TextInput {...props} placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text }]} accessibilityLabel={label} /></View></View>;
}

function Message({ text }: { text: string }) {
  const { colors } = useTheme();
  return <View style={[styles.message, { backgroundColor: colors.dangerSoft }]} accessibilityRole="alert"><AppText variant="caption" style={{ color: colors.danger }}>{text}</AppText></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  frame: { width: '100%', maxWidth: 1180, borderWidth: 1, overflow: 'hidden' },
  frameDesktop: { minHeight: 680, flexDirection: 'row' },
  formSide: { padding: spacing.xxxl, gap: spacing.xl },
  formSideDesktop: { flex: 0.88, padding: 48, justifyContent: 'center' },
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start' },
  title: { gap: spacing.sm },
  field: { gap: spacing.sm },
  inputWrap: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  input: { flex: 1, fontSize: 16, outlineStyle: 'none' } as never,
  message: { borderRadius: radius.md, padding: spacing.md },
});
