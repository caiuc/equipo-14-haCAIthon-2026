export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
} as const;

export const radius = {
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  pill: 0,
} as const;

export const lightColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#FFFFFF',
  surfaceStrong: '#000000',
  text: '#000000',
  textMuted: '#000000',
  textOnStrong: '#FFFFFF',
  border: '#000000',
  borderStrong: '#000000',
  primary: '#7BCB3B',
  primaryPressed: '#64B52B',
  environmental: '#7BCB3B',
  environmentalSoft: '#FFFFFF',
  blue: '#7BCB3B',
  yellow: '#7BCB3B',
  danger: '#000000',
  dangerSoft: '#FFFFFF',
  focus: '#7BCB3B',
  scrim: 'rgba(0, 0, 0, 0.72)',
} as const;

export const darkColors = {
  background: '#000000',
  surface: '#000000',
  surfaceMuted: '#000000',
  surfaceStrong: '#000000',
  text: '#FFFFFF',
  textMuted: '#FFFFFF',
  textOnStrong: '#FFFFFF',
  border: '#FFFFFF',
  borderStrong: '#FFFFFF',
  primary: '#91E653',
  primaryPressed: '#7BD43F',
  environmental: '#91E653',
  environmentalSoft: '#000000',
  blue: '#91E653',
  yellow: '#91E653',
  danger: '#FFFFFF',
  dangerSoft: '#000000',
  focus: '#91E653',
  scrim: 'rgba(0, 0, 0, 0.68)',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };
