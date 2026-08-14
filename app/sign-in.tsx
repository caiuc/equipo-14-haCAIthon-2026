import { ArrowRight, Check, Globe2, LockKeyhole, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { useAppAuth } from '@/auth/AppAuthProvider';
import { AppText, Button, Pill } from '@/design/components';
import { RetornaLogo } from '@/design/Logo';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';

export default function SignInScreen() {
  const { colors } = useTheme();
  const auth = useAppAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 840;
  const [email, setEmail] = useState(auth.isDemo ? 'martina.rojas@uc.cl' : '');
  const [loading, setLoading] = useState(false);
  const enter = async () => {
    setLoading(true);
    try { await auth.signIn(); router.replace('/home'); } finally { setLoading(false); }
  };
  const create = async () => {
    setLoading(true);
    try { await auth.signUp(); router.replace('/onboarding'); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.frame, desktop && styles.frameDesktop]}>
          {desktop && <View style={[styles.hero, { backgroundColor: colors.surfaceStrong }]}>
            <RetornaLogo inverted />
            <View style={styles.heroContent}>
              <Pill label="Comunidad UC · Santiago" tone="primary" />
              <AppText variant="display" style={{ color: colors.textOnStrong, fontSize: 46, lineHeight: 49 }}>Tu reciclaje mueve a toda una comunidad.</AppText>
              <AppText style={{ color: colors.textOnStrong, opacity: 0.7, fontSize: 17, lineHeight: 25 }}>Registra en segundos, aporta a tu equipo y haz visible el impacto colectivo.</AppText>
              <View style={styles.proofList}>
                {['Competencia con propósito', 'Misiones para toda la UC', 'Impacto siempre estimado y transparente'].map((item) => <View key={item} style={styles.proof}><View style={[styles.check, { backgroundColor: colors.environmental }]}><Check size={14} color="#FFFFFF" /></View><AppText variant="bodyStrong" style={{ color: colors.textOnStrong }}>{item}</AppText></View>)}
              </View>
            </View>
            <View style={styles.heroMetric}><AppText variant="eyebrow" style={{ color: colors.environmental }}>Misión activa</AppText><AppText variant="metric" style={{ color: colors.textOnStrong }}>6.127 / 10.000</AppText><AppText variant="caption" style={{ color: colors.textOnStrong, opacity: 0.65 }}>botellas PET · avance colectivo</AppText></View>
          </View>}
          <View style={[styles.formSide, desktop && styles.formSideDesktop]}>
            {!desktop && <RetornaLogo />}
            <View style={styles.formHeader}>
              <AppText variant="h1">Vuelve a sumar</AppText>
              <AppText style={{ color: colors.textMuted }}>Ingresa para ver cómo avanza tu comunidad.</AppText>
              {auth.isDemo && <Pill label="Demo lista para explorar" tone="positive" />}
            </View>
            <Button label="Continuar con Google" icon={Globe2} variant="dark" onPress={enter} loading={loading} />
            <View style={styles.divider}><View style={[styles.line, { backgroundColor: colors.border }]} /><AppText variant="caption" style={{ color: colors.textMuted }}>o con correo</AppText><View style={[styles.line, { backgroundColor: colors.border }]} /></View>
            <View style={styles.inputGroup}>
              <AppText variant="caption">Correo</AppText>
              <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}><Mail size={18} color={colors.textMuted} /><TextInput value={email} onChangeText={setEmail} placeholder="nombre@uc.cl" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { color: colors.text }]} accessibilityLabel="Correo electrónico" /></View>
            </View>
            <Button label={auth.isDemo ? 'Entrar a la demo' : 'Continuar con correo'} icon={ArrowRight} onPress={enter} loading={loading} />
            <Pressable onPress={create} accessibilityRole="button" style={styles.createLink}><AppText style={{ color: colors.textMuted }}>¿Primera vez?</AppText><AppText variant="bodyStrong" style={{ color: colors.primary }}>Crear cuenta</AppText></Pressable>
            <View style={styles.security}><LockKeyhole size={15} color={colors.textMuted} /><AppText variant="caption" style={{ color: colors.textMuted, flex: 1 }}>Sesiones protegidas por Clerk. Retorna nunca almacena tu contraseña.</AppText></View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  frame: { width: '100%', maxWidth: 1080 },
  frameDesktop: { minHeight: 650, flexDirection: 'row', borderRadius: 30, overflow: 'hidden' },
  hero: { flex: 1.12, padding: 38, justifyContent: 'space-between', minHeight: 650 },
  heroContent: { gap: spacing.xl, maxWidth: 480 },
  proofList: { gap: spacing.md, marginTop: spacing.sm },
  proof: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heroMetric: { gap: 4 },
  formSide: { paddingVertical: spacing.xxxl, gap: spacing.xl },
  formSideDesktop: { flex: 0.88, padding: 48, justifyContent: 'center' },
  formHeader: { gap: spacing.sm, marginBottom: spacing.md },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { height: 1, flex: 1 },
  inputGroup: { gap: spacing.sm },
  inputWrap: { minHeight: 50, borderWidth: 1, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  input: { flex: 1, fontSize: 16, outlineStyle: 'none' } as never,
  createLink: { minHeight: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  security: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.md },
});
