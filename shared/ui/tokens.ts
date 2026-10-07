/**
 * Design tokens (DESIGN-SYSTEM.md, "Color tokens").
 * The MUI color schemes need real hex values, so they read this file.
 * app/globals.css mirrors the same values as `--c-*` CSS variables for Tailwind and plain CSS:
 * change both together.
 */
export const colorTokens = {
  light: {
    primary: '#0E5E57',
    primaryHover: '#0A4A44',
    primarySoft: '#E3F0EE',
    onPrimary: '#FFFFFF',
    secondary: '#3F4A48',
    bg: '#F6F7F7',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#DDE2E1',
    text: '#17201F',
    text2: '#4A5654',
    muted: '#66706E',
    success: '#1E7A46',
    warning: '#A15C07',
    error: '#B42318',
    info: '#1F5F99',
    student: '#6B4FA0',
  },
  dark: {
    primary: '#4FB3A6',
    primaryHover: '#6CC4B8',
    primarySoft: '#123A36',
    onPrimary: '#0F1413',
    secondary: '#C9D1CF',
    bg: '#0F1413',
    surface: '#161D1C',
    surfaceRaised: '#1D2625',
    border: '#2A3533',
    text: '#E8EDEC',
    text2: '#B3BEBC',
    muted: '#82908D',
    success: '#5CC48A',
    warning: '#E3A54A',
    error: '#F07A6E',
    info: '#7FB2E5',
    student: '#B59BE0',
  },
} as const;

export type ColorScheme = keyof typeof colorTokens;
