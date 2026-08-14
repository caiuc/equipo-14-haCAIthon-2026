import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  Mail,
  Play,
  Recycle,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { z } from 'zod';

import { useAppAuth } from '@/auth/AppAuthProvider';
import { AuthScaleHero } from '@/auth/AuthScaleHero';
import { AppText, Button } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';

const campusImage = require('../assets/campus-uc.jpg');

const loginSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

const steps = [
  {
    number: '01',
    title: 'Registra',
    detail: 'Elige el material y la cantidad. Cada acción queda reunida en tu historial personal.',
  },
  {
    number: '02',
    title: 'Conecta',
    detail: 'Únete por ID a tu campus u organización para que tu aporte también impulse a tu comunidad.',
  },
  {
    number: '03',
    title: 'Avanza',
    detail: 'Sigue tu semana, completa desafíos y descubre cómo un hábito individual mueve al colectivo.',
  },
];

const platformFeatures: { icon: LucideIcon; title: string; detail: string }[] = [
  {
    icon: Recycle,
    title: 'Tu actividad, en un solo lugar',
    detail: 'Registra materiales y vuelve a consultar las acciones que ya sumaste.',
  },
  {
    icon: UsersRound,
    title: 'Comunidades con propósito',
    detail: 'Conecta tu perfil a una organización mediante su ID y participa en objetivos compartidos.',
  },
  {
    icon: Trophy,
    title: 'Desafíos que se entienden',
    detail: 'Mira qué falta para completar una misión y cómo avanza el grupo durante la semana.',
  },
  {
    icon: BarChart3,
    title: 'Progreso visible',
    detail: 'Tu perfil reúne estadísticas simples para que puedas reconocer y sostener el hábito.',
  },
];

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
        <View style={styles.page}>
          <ImageBackground source={campusImage} resizeMode="cover" style={styles.authBackdrop}>
            <View pointerEvents="none" style={styles.authOverlay} />
            <View style={[styles.authPanel, desktop && styles.authPanelDesktop]}>
              <AuthScaleHero transparent />
              <View style={[styles.formSide, desktop && styles.formSideDesktop]}>
                <View style={styles.formHeader}>
                  <AppText variant="h1" style={styles.authText}>Vuelve a sumar</AppText>
                  <AppText style={styles.authText}>Ingresa con el correo y contraseña de tu cuenta.</AppText>
                </View>
                {auth.configurationError && <View style={[styles.message, styles.authMessage]}><AppText variant="caption" style={styles.authText}>Supabase no está conectado. Puedes recorrer la plataforma usando los datos locales del modo demo.</AppText></View>}
                {error && <View style={[styles.message, styles.authMessage]} accessibilityRole="alert"><AppText variant="caption" style={styles.authText}>{error}</AppText></View>}
                <AuthInput inverted label="Correo" icon={<Mail size={18} color="#FFFFFF" />} value={email} onChangeText={setEmail} placeholder="nombre@uc.cl" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
                <AuthInput inverted label="Contraseña" icon={<LockKeyhole size={18} color="#FFFFFF" />} value={password} onChangeText={setPassword} placeholder="Tu contraseña" secureTextEntry autoComplete="current-password" />
                <Button label="Iniciar sesión" icon={ArrowRight} onPress={() => void enter()} loading={loading} disabled={Boolean(auth.configurationError)} />
                <Button label="Entrar en modo demo" icon={Play} variant="dark" onPress={enterDemo} style={styles.authSecondaryButton} />
                <Pressable onPress={() => router.push('/sign-up')} accessibilityRole="link" style={styles.createLink}><AppText style={styles.authText}>¿Primera vez?</AppText><AppText variant="bodyStrong" style={{ color: colors.primary }}>Crear cuenta</AppText></Pressable>
                <View style={styles.security}><LockKeyhole size={15} color="#FFFFFF" /><AppText variant="caption" style={[styles.authText, styles.securityText]}>El modo demo no necesita credenciales ni conexión externa.</AppText></View>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.landingContent}>
            <View style={styles.storySection}>
              <View style={[styles.storyLead, desktop && styles.storyLeadDesktop]}>
                <View style={styles.storyTitle}>
                  <AppText variant="eyebrow" style={{ color: colors.primary }}>Una acción. Cinco escalas.</AppText>
                  <AppText variant="display" style={styles.displayTitle}>Tu reciclaje no termina en el contenedor.</AppText>
                </View>
                <AppText style={styles.storyCopy}>
                  Retorna convierte acciones cotidianas en progreso visible. Lo que registras construye tu hábito,
                  aporta a tu comunidad y hace más fácil avanzar hacia una meta común.
                </AppText>
              </View>

              <View style={[styles.steps, desktop && styles.stepsDesktop]}>
                {steps.map((step) => <LandingStep key={step.number} {...step} />)}
              </View>
            </View>

            <View style={[styles.platformSection, { backgroundColor: colors.surfaceStrong, borderColor: colors.textOnStrong }]}>
              <View style={styles.platformHeader}>
                <AppText variant="eyebrow" style={{ color: colors.primary }}>Hecho para avanzar en conjunto</AppText>
                <AppText variant="display" style={{ color: colors.textOnStrong, maxWidth: 650 }}>Lo simple también puede mover una comunidad.</AppText>
              </View>
              <View style={[styles.featureGrid, desktop && styles.featureGridDesktop]}>
                {platformFeatures.map((feature) => <PlatformFeature key={feature.title} {...feature} desktop={desktop} />)}
              </View>
            </View>

            <View style={[styles.demoSection, desktop && styles.demoSectionDesktop, { backgroundColor: colors.primary }]}>
              <View style={styles.demoCopy}>
                <AppText variant="eyebrow" style={styles.blackText}>Conoce Retorna hoy</AppText>
                <AppText variant="display" style={styles.blackText}>Empieza por un objeto.</AppText>
                <AppText style={[styles.blackText, styles.demoDetail]}>Explora el flujo completo con datos locales. No necesitas una cuenta ni conectar Supabase.</AppText>
              </View>
              <Button label="Explorar modo demo" icon={Play} variant="dark" onPress={enterDemo} style={styles.demoButton} />
            </View>

            <AppText variant="caption" style={[styles.footer, { borderColor: colors.border }]}>RETORNA · TU HÁBITO, TU COMUNIDAD, TU PLANETA</AppText>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LandingStep({ number, title, detail }: { number: string; title: string; detail: string }) {
  const { colors } = useTheme();
  return <View style={[styles.step, { borderColor: colors.border }]}>
    <AppText variant="eyebrow" style={{ color: colors.primary }}>{number}</AppText>
    <AppText variant="h2">{title}</AppText>
    <AppText>{detail}</AppText>
  </View>;
}

function PlatformFeature({ icon: Icon, title, detail, desktop }: { icon: LucideIcon; title: string; detail: string; desktop: boolean }) {
  const { colors } = useTheme();
  return <View style={[styles.feature, desktop && styles.featureDesktop, { borderColor: colors.textOnStrong }]}>
    <Icon size={32} strokeWidth={1.8} color={colors.primary} />
    <View style={styles.featureCopy}>
      <AppText variant="h3" style={{ color: colors.textOnStrong }}>{title}</AppText>
      <AppText style={{ color: colors.textOnStrong }}>{detail}</AppText>
    </View>
  </View>;
}

function AuthInput({ label, icon, inverted = false, ...props }: React.ComponentProps<typeof TextInput> & { label: string; icon: React.ReactNode; inverted?: boolean }) {
  const { colors } = useTheme();
  const foreground = inverted ? '#FFFFFF' : colors.text;
  return <View style={styles.inputGroup}><AppText variant="caption" style={{ color: foreground }}>{label}</AppText><View style={[styles.inputWrap, { borderColor: inverted ? '#FFFFFF' : colors.border, backgroundColor: inverted ? 'rgba(0, 0, 0, 0.5)' : colors.surface }]}>{icon}<TextInput {...props} placeholderTextColor={foreground} style={[styles.input, { color: foreground }]} accessibilityLabel={label} /></View></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  page: { width: '100%', gap: 80 },
  authBackdrop: { width: '100%', overflow: 'hidden' },
  authOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.68)' },
  authPanel: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  authPanelDesktop: { minHeight: 680, flexDirection: 'row' },
  landingContent: { width: '100%', maxWidth: 1212, alignSelf: 'center', paddingHorizontal: spacing.lg, gap: 80 },
  formSide: { padding: spacing.xxxl, gap: spacing.xl },
  formSideDesktop: { flex: 0.88, padding: 48, justifyContent: 'center' },
  formHeader: { gap: spacing.sm, marginBottom: spacing.md },
  authText: { color: '#FFFFFF' },
  authMessage: { backgroundColor: 'rgba(0, 0, 0, 0.72)', borderColor: '#FFFFFF', borderWidth: 1 },
  authSecondaryButton: { borderColor: '#FFFFFF' },
  inputGroup: { gap: spacing.sm },
  inputWrap: { minHeight: 50, borderWidth: 1, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  input: { flex: 1, fontSize: 16, outlineStyle: 'none' } as never,
  createLink: { minHeight: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  security: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.md },
  securityText: { flex: 1 },
  message: { borderRadius: radius.md, padding: spacing.md },
  storySection: { gap: spacing.huge },
  storyLead: { gap: spacing.xxl },
  storyLeadDesktop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  storyTitle: { flex: 1.25, gap: spacing.md },
  displayTitle: { maxWidth: 690 },
  storyCopy: { flex: 0.75, maxWidth: 440, fontSize: 17, lineHeight: 25 },
  steps: { gap: spacing.xxxl },
  stepsDesktop: { flexDirection: 'row' },
  step: { flex: 1, borderTopWidth: 3, paddingTop: spacing.lg, gap: spacing.md },
  platformSection: { padding: spacing.xxxl, gap: spacing.huge, borderWidth: 1 },
  platformHeader: { gap: spacing.lg },
  featureGrid: { gap: spacing.xxxl },
  featureGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  feature: { flexDirection: 'row', gap: spacing.lg, borderTopWidth: 1, paddingTop: spacing.xl },
  featureDesktop: { flexGrow: 1, flexBasis: '46%' },
  featureCopy: { flex: 1, gap: spacing.sm },
  demoSection: { padding: spacing.xxxl, gap: spacing.xxxl },
  demoSectionDesktop: { minHeight: 310, padding: spacing.huge, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  demoCopy: { flex: 1, maxWidth: 700, gap: spacing.md },
  demoDetail: { maxWidth: 540, fontSize: 17, lineHeight: 24 },
  demoButton: { minWidth: 230 },
  blackText: { color: '#000000' },
  footer: { borderTopWidth: 1, paddingVertical: spacing.xxl, textAlign: 'center' },
});
