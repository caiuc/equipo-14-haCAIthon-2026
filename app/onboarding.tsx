import { ArrowRight, Check, GraduationCap, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useRetornaStore } from '@/data/store';
import { AppText, Button, Card, CommunityAvatar, ProgressBar, ScreenScroll } from '@/design/components';
import { RetornaLogo } from '@/design/Logo';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { state, joinCommunity } = useRetornaStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [affiliation, setAffiliation] = useState('Ingeniería UC');
  const [selected, setSelected] = useState<string[]>(['com-ingenieria', 'com-sanjoaquin']);
  const options = ['Ingeniería UC', 'College UC', 'Derecho UC', 'Arquitectura UC', 'Otra unidad UC'];
  const finish = () => { selected.forEach(joinCommunity); router.replace('/home'); };
  return (
    <ScreenScroll contentContainerStyle={styles.screen}>
      <View style={styles.top}><RetornaLogo /><AppText variant="caption" style={{ color: colors.textMuted }}>Paso {step + 1} de 2</AppText></View>
      <ProgressBar value={(step + 1) * 50} color={colors.primary} />
      {step === 0 ? <View style={styles.content}>
        <View style={styles.title}><View style={[styles.icon, { backgroundColor: colors.environmentalSoft }]}><GraduationCap color={colors.environmental} /></View><AppText variant="h1">Haz tu experiencia más tuya</AppText><AppText style={{ color: colors.textMuted }}>Tu afiliación ayuda a encontrar comunidades relevantes. Podrás cambiarla después.</AppText></View>
        <View style={styles.options}>{options.map((item) => <Pressable key={item} onPress={() => setAffiliation(item)} style={[styles.option, { borderColor: affiliation === item ? colors.primary : colors.border, backgroundColor: colors.surface }]}><AppText variant="bodyStrong">{item}</AppText>{affiliation === item && <Check color={colors.primary} size={20} />}</Pressable>)}</View>
        <Button label="Continuar" icon={ArrowRight} onPress={() => setStep(1)} />
      </View> : <View style={styles.content}>
        <View style={styles.title}><View style={[styles.icon, { backgroundColor: colors.environmentalSoft }]}><UsersRound color={colors.environmental} /></View><AppText variant="h1">Elige dónde sumar</AppText><AppText style={{ color: colors.textMuted }}>Puedes pertenecer a varias comunidades; cada reciclaje aportará a una.</AppText></View>
        <View style={styles.options}>{state.communities.filter((item) => item.visibility === 'public').slice(0, 5).map((community) => {
          const active = selected.includes(community.id);
          return <Pressable key={community.id} onPress={() => setSelected((items) => active ? items.filter((id) => id !== community.id) : [...items, community.id])}><Card style={[styles.community, active && { borderColor: colors.primary }]}><CommunityAvatar initials={community.initials} color={community.accent} /><View style={{ flex: 1 }}><AppText variant="bodyStrong">{community.name}</AppText><AppText variant="caption" style={{ color: colors.textMuted }}>{community.tags.join(' · ')}</AppText></View>{active && <Check color={colors.primary} size={20} />}</Card></Pressable>;
        })}</View>
        <Button label="Entrar a Retorna" icon={ArrowRight} onPress={finish} disabled={!selected.length} />
      </View>}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%', maxWidth: 650, alignSelf: 'center', paddingTop: 28 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  content: { gap: spacing.xxl },
  title: { gap: spacing.md },
  icon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  options: { gap: spacing.md },
  option: { minHeight: 58, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  community: { padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
