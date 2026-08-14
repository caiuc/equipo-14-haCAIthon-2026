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
  background: '#F3F7EA',
  surface: '#FCFFF8',
  surfaceMuted: '#E8F1DC',
  surfaceStrong: '#17351B',
  text: '#172419',
  textMuted: '#657263',
  textOnStrong: '#F7FFF0',
  border: '#D5E2CB',
  borderStrong: '#AABD9D',
  primary: '#7BCB3B',
  primaryPressed: '#64B52B',
  environmental: '#7BCB3B',
  environmentalSoft: '#E1F6CB',
  blue: '#7BCB3B',
  yellow: '#7BCB3B',
  danger: '#C73F56',
  dangerSoft: '#FBE4E8',
  focus: '#4D9D23',
  scrim: 'rgba(7, 26, 10, 0.58)',
} as const;

export const darkColors = {
  background: '#071108',
  surface: '#101D12',
  surfaceMuted: '#192A1B',
  surfaceStrong: '#17351B',
  text: '#F1FBEA',
  textMuted: '#A5B6A1',
  textOnStrong: '#F7FFF0',
  border: '#29402B',
  borderStrong: '#4F6B4B',
  primary: '#91E653',
  primaryPressed: '#7BD43F',
  environmental: '#91E653',
  environmentalSoft: '#1D3A20',
  blue: '#91E653',
  yellow: '#91E653',
  danger: '#FF768B',
  dangerSoft: '#45202A',
  focus: '#91E653',
  scrim: 'rgba(0, 0, 0, 0.68)',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };
