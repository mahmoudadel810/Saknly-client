/**
 * Design tokens (DESIGN-SYSTEM.md, "Color tokens").
 * The MUI color schemes need real hex values, so they read this file.
 * app/globals.css mirrors the same values as `--c-*` CSS variables for Tailwind and plain CSS:
 * change both together.
 *
 * v2: `field` is the filled-input background, `accent` the sand accent (icons, stars, badges with `onAccent`
 * text; never body text on white: it measures 3.2:1), and `overPhoto` the white of controls laid on a photo
 * in both modes.
 */
export const colorTokens = {
  light: {
    primary: '#0E5E57',
    primaryHover: '#0A4A44',
    primarySoft: '#E3F0EE',
    onPrimary: '#FFFFFF',
    secondary: '#3F4A48',
    bg: '#F7F6F3',
    surface2: '#FBFAF8',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#DDE2E1',
    borderStrong: '#7E8A88',
    text: '#17201F',
    text2: '#4A5654',
    muted: '#66706E',
    success: '#1E7A46',
    warning: '#A15C07',
    error: '#B42318',
    info: '#1F5F99',
    student: '#6B4FA0',
    field: '#F2F5F4',
    accent: '#C08A3E',
    onAccent: '#1F1608',
    overPhoto: '#FFFFFF',
  },
  dark: {
    primary: '#4FB3A6',
    primaryHover: '#6CC4B8',
    primarySoft: '#123A36',
    onPrimary: '#0F1413',
    secondary: '#C9D1CF',
    bg: '#0D1312',
    surface2: '#121918',
    surface: '#161D1C',
    surfaceRaised: '#1D2625',
    border: '#2A3533',
    borderStrong: '#647371',
    text: '#E8EDEC',
    text2: '#B3BEBC',
    muted: '#82908D',
    success: '#5CC48A',
    warning: '#E3A54A',
    error: '#F07A6E',
    info: '#7FB2E5',
    student: '#B59BE0',
    field: '#1B2422',
    accent: '#E0B36A',
    onAccent: '#1F1608',
    overPhoto: '#FFFFFF',
  },
} as const;

export type ColorScheme = keyof typeof colorTokens;

/** Radii (DESIGN-SYSTEM.md v2): cards and panels 16, inner elements, inputs and buttons 12, small tags 8. */
export const radius = { card: 16, inner: 12, control: 12, tag: 8 } as const;

/** The one soft card shadow and its hover state (v2, "Cards and elevation"). */
export const cardShadow = {
  rest: '0 1px 2px rgba(16, 24, 22, 0.06), 0 4px 16px rgba(16, 24, 22, 0.06)',
  hover: '0 2px 4px rgba(16, 24, 22, 0.08), 0 12px 28px rgba(16, 24, 22, 0.12)',
} as const;
