export type ThemeMode = 'dark' | 'light';

export interface Palette {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  danger: string;
}

export const palettes: Record<ThemeMode, Palette> = {
  dark: {
    bg: '#1A1722',
    surface: '#231F2E',
    border: '#332D44',
    text: '#E6E1F0',
    muted: '#9D96B3',
    primary: '#B9A2E8',
    onPrimary: '#1A1722',
    accent: '#E3A8C6',
    danger: '#E58A8A',
  },
  light: {
    bg: '#F4F0F9',
    surface: '#FBF9FE',
    border: '#E0D8EC',
    text: '#2A2438',
    muted: '#6B6380',
    primary: '#6F52BA',
    onPrimary: '#FFFFFF',
    accent: '#B04A7C',
    danger: '#B83A3A',
  },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 20 } as const;

// Por ahora la app es siempre oscura.
// Cuando exista el interruptor en Ajustes, solo se cambia esta función.
export function useAppTheme(): Palette {
  return palettes.dark;
}