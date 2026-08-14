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
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

export const lightColors = {
  background: '#F5F7F2',
  surface: '#FFFFFF',
  surfaceMuted: '#EBEFE9',
  surfaceStrong: '#0B1628',
  text: '#101B2D',
  textMuted: '#647084',
  textOnStrong: '#F9FAF7',
  border: '#DDE3DB',
  borderStrong: '#BBC5BA',
  primary: '#FF6246',
  primaryPressed: '#E64E34',
  environmental: '#159A79',
  environmentalSoft: '#D9F3EA',
  blue: '#2A7DE1',
  yellow: '#F3B72E',
  danger: '#C73F56',
  dangerSoft: '#FBE4E8',
  focus: '#2A7DE1',
  scrim: 'rgba(5, 12, 24, 0.56)',
} as const;

export const darkColors = {
  background: '#07101E',
  surface: '#101C2E',
  surfaceMuted: '#17253A',
  surfaceStrong: '#F4F7F2',
  text: '#F4F7F2',
  textMuted: '#A7B4C8',
  textOnStrong: '#0B1628',
  border: '#26364D',
  borderStrong: '#43546C',
  primary: '#FF765C',
  primaryPressed: '#FF8B75',
  environmental: '#34D3AA',
  environmentalSoft: '#123C37',
  blue: '#67A7F4',
  yellow: '#F8C85A',
  danger: '#FF768B',
  dangerSoft: '#45202A',
  focus: '#67A7F4',
  scrim: 'rgba(0, 0, 0, 0.68)',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };
