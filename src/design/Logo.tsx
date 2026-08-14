import Svg, { Circle, Path } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { useTheme } from './theme';
import { AppText } from './components';

export function RetornaMark({ size = 34, inverted = false, foregroundColor }: { size?: number; inverted?: boolean; foregroundColor?: string }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Símbolo Retorna">
      <Path d="M18 22c7-8.7 20.6-9.3 28.5-1.7l-4.3 4.2c-5.5-5.1-14.5-4.7-19.5 1.3L18 22Z" fill={colors.primary} />
      <Path d="m45.4 15.6 2.5 11.7-11.7.5 9.2-12.2Z" fill={colors.primary} />
      <Path d="M46 42c-7 8.7-20.6 9.3-28.5 1.7l4.3-4.2c5.5 5.1 14.5 4.7 19.5-1.3L46 42Z" fill={colors.environmental} />
      <Path d="m18.6 48.4-2.5-11.7 11.7-.5-9.2 12.2Z" fill={colors.environmental} />
      <Circle cx="32" cy="32" r="5.5" fill={foregroundColor ?? (inverted ? colors.textOnStrong : colors.surfaceStrong)} />
    </Svg>
  );
}

export function RetornaLogo({ compact = false, inverted = false, foregroundColor }: { compact?: boolean; inverted?: boolean; foregroundColor?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="header">
      <RetornaMark size={compact ? 38 : 50} inverted={inverted} foregroundColor={foregroundColor} />
      {!compact && <AppText variant="logo" style={{ color: foregroundColor ?? (inverted ? colors.textOnStrong : colors.text) }}>retorna</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
