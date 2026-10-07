import { createTheme, type Theme } from '@mui/material/styles';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { colorTokens, type ColorScheme } from './tokens';

// Set on <html> by next/font in app/layout.tsx.
const FONT_STACK =
  'var(--font-sans), system-ui, -apple-system, "Segoe UI", Tahoma, Arial, sans-serif';

const schemePalette = (scheme: ColorScheme) => {
  const t = colorTokens[scheme];
  return {
    primary: { main: t.primary, dark: t.primaryHover, contrastText: t.onPrimary },
    secondary: { main: t.secondary },
    success: { main: t.success },
    warning: { main: t.warning },
    error: { main: t.error },
    info: { main: t.info },
    background: { default: t.bg, paper: t.surface },
    text: { primary: t.text, secondary: t.text2 },
    divider: t.border,
  };
};

const vars = (theme: Theme) => theme.vars ?? (theme as unknown as NonNullable<Theme['vars']>);

const focusRing = (theme: Theme) => ({
  outline: `2px solid ${vars(theme).palette.primary.main}`,
  outlineOffset: 2,
});

// The Outlined "check" glyph, used as a mask so it takes the theme colour.
const CHECK_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E\")";

// Menus, popovers and dialogs sit on the raised surface; nothing else does.
const raisedSurface = (theme: Theme) => ({
  backgroundColor: colorTokens.light.surfaceRaised,
  ...theme.applyStyles('dark', { backgroundColor: colorTokens.dark.surfaceRaised }),
});

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: '.%s' },
  colorSchemes: {
    light: { palette: schemePalette('light') },
    dark: { palette: schemePalette('dark') },
  },
  direction: 'rtl',
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: FONT_STACK,
    allVariants: { letterSpacing: 0 },
    h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.3 }, // hero only
    h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.35 },
    h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4 }, // page title
    h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.45 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.5 }, // section
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 }, // card title
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.6 }, // label
    body1: { fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.7 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6 }, // secondary
    caption: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.5 }, // metadata
    overline: { fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.5, textTransform: 'none' },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
          '&.Mui-focusVisible': focusRing(theme),
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({ '&.Mui-focusVisible': focusRing(theme) }),
      },
    },
    /*
     * Text fields and selects (DESIGN-SYSTEM.md, "FormField conventions"): a 44px box, a static label above it
     * (no floating label, no notch in the outline), a 2px focus border, helper and error text below, and
     * adornments inside the box. MUI writes its own spacing with physical properties, which the RTL style cache
     * mirrors; the overrides here use logical properties only and come after MUI's in the same rule, so they win.
     */
    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: ({ theme }) => ({
          position: 'relative',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          transform: 'none',
          maxWidth: '100%',
          whiteSpace: 'normal',
          overflow: 'visible',
          pointerEvents: 'auto',
          marginBlockEnd: 6,
          fontSize: '0.8125rem',
          fontWeight: 500,
          lineHeight: 1.5,
          color: vars(theme).palette.text.primary,
          '&.Mui-focused': { color: vars(theme).palette.text.primary },
          '&.Mui-error': { color: vars(theme).palette.error.main },
          '&.Mui-disabled': { color: vars(theme).palette.text.disabled },
          '& .MuiFormLabel-asterisk': { color: vars(theme).palette.error.main },
        }),
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: vars(theme).palette.text.primary,
          '&.Mui-focused': { color: vars(theme).palette.text.primary },
          '& .MuiFormLabel-asterisk': { color: vars(theme).palette.error.main },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          minHeight: 44,
          backgroundColor: vars(theme).palette.background.paper,
          '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: vars(theme).palette.text.secondary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: vars(theme).palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: vars(theme).palette.error.main },
          '&.MuiInputBase-adornedStart': { paddingInlineStart: 12 },
          '&.MuiInputBase-adornedEnd': { paddingInlineEnd: 6 },
          '&.MuiInputBase-multiline': { paddingBlock: 10, paddingInline: 12 },
          '&.MuiInputBase-sizeSmall': { minHeight: 36 },
        }),
        input: {
          paddingBlock: 11,
          paddingInline: 12,
          // Edge's built-in reveal and clear buttons would sit next to our own eye toggle.
          '&::-ms-reveal, &::-ms-clear': { display: 'none' },
        },
        inputSizeSmall: { paddingBlock: 7, paddingInline: 10 },
        inputAdornedStart: { paddingInlineStart: 0 },
        inputAdornedEnd: { paddingInlineEnd: 0 },
        notchedOutline: ({ theme }) => ({
          top: 0,
          borderColor: colorTokens.light.borderStrong,
          ...theme.applyStyles('dark', { borderColor: colorTokens.dark.borderStrong }),
          transition: 'border-color 150ms ease-out',
          '& legend': { display: 'none' },
        }),
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: vars(theme).palette.text.secondary,
          '& .MuiSvgIcon-root': { fontSize: 20 },
          // An icon button in an adornment stays inside the box: no negative "edge" margin.
          '& .MuiIconButton-root': { marginInline: 0, padding: 6 },
        }),
        positionStart: { marginInline: 0, marginInlineEnd: 8 },
        positionEnd: { marginInline: 0, marginInlineStart: 4 },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { marginInline: 0, marginBlockStart: 6, fontSize: '0.8125rem', lineHeight: 1.5 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: KeyboardArrowDownOutlined,
        MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } },
      },
      styleOverrides: {
        icon: ({ theme }) => ({
          right: 'auto',
          left: 'auto',
          insetInlineEnd: 10,
          fontSize: 20,
          color: vars(theme).palette.text.secondary,
          transition: 'transform 150ms ease-out',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        // backgroundImage: no dark-mode elevation overlay. Low elevations (plain Paper, Card, Accordion,
        // TableContainer) are flat panels with a 1px border; menus (8), drawers (16) and dialogs (24) keep
        // their shadow.
        root: ({ theme, ownerState }) => ({
          backgroundImage: 'none',
          ...(ownerState.variant !== 'outlined' &&
            (ownerState.elevation ?? 1) >= 1 &&
            (ownerState.elevation ?? 1) <= 3 && {
              boxShadow: 'none',
              border: `1px solid ${vars(theme).palette.divider}`,
            }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({ borderRadius: 12, ...raisedSurface(theme) }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 10,
          border: `1px solid ${vars(theme).palette.divider}`,
          ...raisedSurface(theme),
        }),
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme }) => ({ boxShadow: theme.shadows[8], ...raisedSurface(theme) }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          minHeight: 40,
          '&.Mui-selected': { backgroundColor: vars(theme).palette.action.selected },
          // Select options: the chosen one carries a check mark at the inline end.
          '&[role="option"]': { gap: 8 },
          '&[role="option"].Mui-selected': { fontWeight: 600 },
          '&[role="option"].Mui-selected::after': {
            content: '""',
            flexShrink: 0,
            width: 18,
            height: 18,
            marginInlineStart: 'auto',
            backgroundColor: vars(theme).palette.primary.main,
            WebkitMask: `${CHECK_MASK} center / contain no-repeat`,
            mask: `${CHECK_MASK} center / contain no-repeat`,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTable: {
      defaultProps: { size: 'small' },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottomColor: vars(theme).palette.divider,
          fontSize: '0.8125rem',
        }),
        sizeSmall: { paddingBlock: 10, paddingInline: 12 },
        head: ({ theme }) => ({
          fontWeight: 600,
          color: vars(theme).palette.text.secondary,
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          fontSize: '0.8125rem',
          borderRadius: 6,
          backgroundColor: colorTokens.light.text,
          color: colorTokens.light.surface,
          ...theme.applyStyles('dark', {
            backgroundColor: colorTokens.dark.text,
            color: colorTokens.dark.bg,
          }),
        }),
        arrow: ({ theme }) => ({
          color: colorTokens.light.text,
          ...theme.applyStyles('dark', { color: colorTokens.dark.text }),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 6, alignItems: 'center' },
      },
    },
  },
});
