import { ArrowRight, LockKeyhole, Mail, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { z } from 'zod';

import { useAppAuth } from '@/auth/AppAuthProvider';
import { AuthScaleHero } from '@/auth/AuthScaleHero';
import { AppText, Button } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';

const loginSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export default function SignInScreen() {
  const { colors } = useTheme();
  const auth = useAppAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 840;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const enter = async () => {
    setError(undefined);
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos ingresados.');
      return;
    }
    setLoading(true);
    try {
      await auth.signIn(parsed.data);
      router.replace('/home');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const enterDemo = () => {
    auth.enterDemo();
    router.replace('/home');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.frame, desktop && styles.frameDesktop, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <AuthScaleHero />
          <View style={[styles.formSide, desktop && styles.formSideDesktop, { backgroundColor: colors.surface }]}>
            <View style={styles.formHeader}>
              <AppText variant="h1">Vuelve a sumar</AppText>
              <AppText style={{ color: colors.textMuted }}>Ingresa con el correo y contraseña de tu cuenta.</AppText>
            </View>
            {auth.configurationError && <View style={[styles.message, { backgroundColor: colors.surfaceMuted }]}><AppText variant="caption" style={{ color: colors.textMuted }}>Supabase no está conectado. Puedes recorrer la plataforma usando los datos locales del modo demo.</AppText></View>}
            {error && <View style={[styles.message, { backgroundColor: colors.dangerSoft }]} accessibilityRole="alert"><AppText variant="caption" style={{ color: colors.danger }}>{error}</AppText></View>}
            <AuthInput label="Correo" icon={<Mail size={18} color={colors.textMuted} />} value={email} onChangeText={setEmail} placeholder="nombre@uc.cl" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <AuthInput label="Contraseña" icon={<LockKeyhole size={18} color={colors.textMuted} />} value={password} onChangeText={setPassword} placeholder="Tu contraseña" secureTextEntry autoComplete="current-password" />
            <Button label="Iniciar sesión" icon={ArrowRight} onPress={() => void enter()} loading={loading} disabled={Boolean(auth.configurationError)} />
            <Button label="Entrar en modo demo" icon={Play} variant="secondary" onPress={enterDemo} />
            <Pressable onPress={() => router.push('/sign-up')} accessibilityRole="link" style={styles.createLink}><AppText style={{ color: colors.textMuted }}>¿Primera vez?</AppText><AppText variant="bodyStrong" style={{ color: colors.primary }}>Crear cuenta</AppText></Pressable>
            <View style={styles.security}><LockKeyhole size={15} color={colors.textMuted} /><AppText variant="caption" style={{ color: colors.textMuted, flex: 1 }}>El modo demo no necesita credenciales ni conexión externa.</AppText></View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthInput({ label, icon, ...props }: React.ComponentProps<typeof TextInput> & { label: string; icon: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={styles.inputGroup}><AppText variant="caption">{label}</AppText><View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>{icon}<TextInput {...props} placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text }]} accessibilityLabel={label} /></View></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  frame: { width: '100%', maxWidth: 1180, borderWidth: 1, overflow: 'hidden' },
  frameDesktop: { minHeight: 680, flexDirection: 'row' },
  formSide: { padding: spacing.xxxl, gap: spacing.xl },
  formSideDesktop: { flex: 0.88, padding: 48, justifyContent: 'center' },
  formHeader: { gap: spacing.sm, marginBottom: spacing.md },
  inputGroup: { gap: spacing.sm },
  inputWrap: { minHeight: 50, borderWidth: 1, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  input: { flex: 1, fontSize: 16, outlineStyle: 'none' } as never,
  createLink: { minHeight: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  security: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.md },
  message: { borderRadius: radius.md, padding: spacing.md },
});
