import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor =
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'fuchsia'
  | 'green'
  | 'indigo'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'rose'
  | 'sky'
  | 'teal'
  | 'violet'
  | 'yellow';

export type NavPosition = 'left' | 'bottom' | 'right';

export const ACCENT_THEMES: Record<AccentColor, { primary: string; chart: string[] }> = {
  amber: { primary: 'oklch(0.795 0.184 86.047)', chart: ['oklch(0.795 0.184 86.047)', 'oklch(0.7 0.15 70)', 'oklch(0.65 0.2 90)', 'oklch(0.8 0.12 60)', 'oklch(0.6 0.22 100)'] },
  blue: { primary: 'oklch(0.623 0.214 259.815)', chart: ['oklch(0.623 0.214 259.815)', 'oklch(0.55 0.2 240)', 'oklch(0.7 0.18 270)', 'oklch(0.68 0.16 230)', 'oklch(0.75 0.14 280)'] },
  cyan: { primary: 'oklch(0.715 0.143 215.221)', chart: ['oklch(0.715 0.143 215.221)', 'oklch(0.65 0.13 200)', 'oklch(0.78 0.12 230)', 'oklch(0.6 0.15 190)', 'oklch(0.82 0.1 240)'] },
  emerald: { primary: 'oklch(0.723 0.219 149.579)', chart: ['oklch(0.723 0.219 149.579)', 'oklch(0.65 0.2 140)', 'oklch(0.8 0.18 160)', 'oklch(0.58 0.22 130)', 'oklch(0.85 0.15 170)'] },
  fuchsia: { primary: 'oklch(0.667 0.295 322.15)', chart: ['oklch(0.667 0.295 322.15)', 'oklch(0.6 0.28 310)', 'oklch(0.73 0.26 340)', 'oklch(0.55 0.3 300)', 'oklch(0.78 0.22 350)'] },
  green: { primary: 'oklch(0.723 0.219 149.579)', chart: ['oklch(0.723 0.219 149.579)', 'oklch(0.65 0.2 140)', 'oklch(0.8 0.18 160)', 'oklch(0.58 0.22 130)', 'oklch(0.85 0.15 170)'] },
  indigo: { primary: 'oklch(0.585 0.233 277.117)', chart: ['oklch(0.585 0.233 277.117)', 'oklch(0.52 0.22 260)', 'oklch(0.65 0.2 290)', 'oklch(0.48 0.24 250)', 'oklch(0.7 0.18 300)'] },
  lime: { primary: 'oklch(0.841 0.238 128.85)', chart: ['oklch(0.841 0.238 128.85)', 'oklch(0.78 0.22 120)', 'oklch(0.9 0.2 140)', 'oklch(0.72 0.24 110)', 'oklch(0.95 0.16 150)'] },
  orange: { primary: 'oklch(0.705 0.213 47.604)', chart: ['oklch(0.705 0.213 47.604)', 'oklch(0.64 0.2 40)', 'oklch(0.77 0.18 55)', 'oklch(0.58 0.22 35)', 'oklch(0.82 0.15 65)'] },
  pink: { primary: 'oklch(0.656 0.241 354.308)', chart: ['oklch(0.656 0.241 354.308)', 'oklch(0.6 0.23 340)', 'oklch(0.72 0.2 370)', 'oklch(0.55 0.25 330)', 'oklch(0.78 0.18 380)'] },
  purple: { primary: 'oklch(0.627 0.265 303.9)', chart: ['oklch(0.627 0.265 303.9)', 'oklch(0.56 0.25 290)', 'oklch(0.7 0.23 320)', 'oklch(0.5 0.27 280)', 'oklch(0.75 0.2 330)'] },
  red: { primary: 'oklch(0.637 0.237 25.331)', chart: ['oklch(0.637 0.237 25.331)', 'oklch(0.57 0.22 15)', 'oklch(0.7 0.2 35)', 'oklch(0.52 0.24 10)', 'oklch(0.75 0.18 45)'] },
  rose: { primary: 'oklch(0.645 0.246 16.439)', chart: ['oklch(0.645 0.246 16.439)', 'oklch(0.58 0.23 10)', 'oklch(0.71 0.21 25)', 'oklch(0.53 0.25 5)', 'oklch(0.76 0.19 35)'] },
  sky: { primary: 'oklch(0.685 0.169 237.323)', chart: ['oklch(0.685 0.169 237.323)', 'oklch(0.62 0.16 225)', 'oklch(0.75 0.14 250)', 'oklch(0.56 0.17 215)', 'oklch(0.8 0.12 260)'] },
  teal: { primary: 'oklch(0.704 0.14 182.503)', chart: ['oklch(0.704 0.14 182.503)', 'oklch(0.64 0.13 170)', 'oklch(0.77 0.12 195)', 'oklch(0.58 0.15 160)', 'oklch(0.82 0.1 205)'] },
  violet: { primary: 'oklch(0.606 0.25 292.717)', chart: ['oklch(0.606 0.25 292.717)', 'oklch(0.54 0.24 280)', 'oklch(0.67 0.22 305)', 'oklch(0.48 0.26 270)', 'oklch(0.72 0.2 315)'] },
  yellow: { primary: 'oklch(0.795 0.184 86.047)', chart: ['oklch(0.795 0.184 86.047)', 'oklch(0.73 0.17 80)', 'oklch(0.85 0.15 95)', 'oklch(0.67 0.19 70)', 'oklch(0.9 0.12 100)'] },
};

export function applyAccentTheme(color: AccentColor) {
  const theme = ACCENT_THEMES[color];
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--accent', theme.primary);
  root.style.setProperty('--ring', theme.primary);
  theme.chart.forEach((c, i) => {
    root.style.setProperty(`--chart-${i + 1}`, c);
  });
}

export interface ThemeSettings {
  accentColor: AccentColor;
  navPosition: NavPosition;
  useSystemTheme: boolean;
}

interface ThemeStore extends ThemeSettings {
  setAccentColor: (color: AccentColor) => void;
  setNavPosition: (position: NavPosition) => void;
  setUseSystemTheme: (value: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      accentColor: 'green',
      navPosition: 'bottom',
      useSystemTheme: false,
      setAccentColor: (accentColor) => set({ accentColor }),
      setNavPosition: (navPosition) => set({ navPosition }),
      setUseSystemTheme: (useSystemTheme) => set({ useSystemTheme }),
    }),
    { name: 'worldsilo-theme' },
  ),
);
