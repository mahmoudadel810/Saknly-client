import { createElement } from 'react';
import { createTheme, type Theme } from '@mui/material/styles';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { colorTokens, radius, type ColorScheme } from './tokens';
import {
  CheckboxCheckedIcon,
  CheckboxIcon,
  CheckboxIndeterminateIcon,
  RadioCheckedIcon,
  RadioIcon,
} from './controlIcons';

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

/** A token at an alpha, for tints and rings: `tint('--c-primary', 15)`. */
const tint = (token: string, percent: number) => `color-mix(in srgb, var(${token}) ${percent}%, transparent)`;

// Mask glyphs (Outlined icons), so they take the theme colour.
const CHECK_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E\")";
const ERROR_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8'/%3E%3C/svg%3E\")";

// Menus, popovers and dialogs sit on the raised surface.
const raisedSurface = (theme: Theme) => ({
  backgroundColor: colorTokens.light.surfaceRaised,
  ...theme.applyStyles('dark', { backgroundColor: colorTokens.dark.surfaceRaised }),
});

const MENU_SHADOW = '0 4px 12px rgba(16, 24, 22, 0.08), 0 16px 40px rgba(16, 24, 22, 0.14)';

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: '.%s' },
  colorSchemes: {
    light: { palette: schemePalette('light') },
    dark: { palette: schemePalette('dark') },
  },
  direction: 'rtl',
  // Small shapes only (toggle groups, tooltips). Inputs, buttons, cards and dialogs set their own radius below.
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: FONT_STACK,
    allVariants: { letterSpacing: 0 },
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.25 }, // hero only
    h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.35 },
    h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4 }, // page title
    h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.45 },
    h5: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.45 }, // section title (v2)
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 }, // card title
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.6 }, // label
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.75 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.65 }, // secondary
    caption: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.5 }, // metadata
    overline: { fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.5, textTransform: 'none' },
    button: { fontSize: '0.9375rem', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    /*
     * Buttons (v2): 44px high (36 small, 48 large), radius 12, weight 600.
     * - contained primary: green with white text;
     * - outlined primary is the tonal secondary: --c-primary-soft background, primary text, no border;
     * - outlined in another colour (inherit, secondary, error) stays a quiet 1px outline;
     * - text is the ghost button for tertiary actions.
     */
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radius.control,
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
          paddingInline: 20,
          gap: 2,
          transition:
            'background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out',
          '&.Mui-focusVisible': focusRing(theme),
          '& .MuiButton-startIcon': { marginInlineStart: -4, marginInlineEnd: 6 },
          '& .MuiButton-endIcon': { marginInlineStart: 6, marginInlineEnd: -4 },
        }),
        sizeSmall: { minHeight: 36, paddingInline: 14, fontSize: '0.875rem' },
        sizeLarge: { minHeight: 48, paddingInline: 24, fontSize: '1rem' },
        containedPrimary: ({ theme }) => ({
          '&:hover': { backgroundColor: vars(theme).palette.primary.dark },
        }),
        outlined: ({ theme }) => ({
          borderColor: vars(theme).palette.divider,
          '&:hover': { borderColor: colorTokens.light.borderStrong, backgroundColor: vars(theme).palette.action.hover },
          ...theme.applyStyles('dark', { '&:hover': { borderColor: colorTokens.dark.borderStrong } }),
        }),
        text: { paddingInline: 12 },
      },
      variants: [
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            backgroundColor: 'var(--c-primary-soft)',
            border: '1px solid transparent',
            color: 'var(--c-primary)',
            '&:hover': {
              backgroundColor: 'color-mix(in srgb, var(--c-primary) 16%, var(--c-surface))',
              borderColor: 'transparent',
            },
            '&.Mui-disabled': { backgroundColor: 'var(--c-field)', borderColor: 'transparent' },
          },
        },
        {
          props: { variant: 'text', color: 'primary' },
          style: { '&:hover': { backgroundColor: tint('--c-primary', 8) } },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '50%',
          transition: 'background-color 150ms ease-out, color 150ms ease-out',
          '&.Mui-focusVisible': focusRing(theme),
        }),
        // A 40px circle at the default size; "small" stays compact for dense table rows.
        sizeMedium: { width: 40, height: 40, padding: 8 },
      },
    },
    /*
     * Text fields and selects (v2 "Inputs: filled, soft, generous"): a 48px box (40 small) on --c-field with a
     * 12px radius and no border at rest; a 1px --c-border-strong outline on hover; on focus a 2px primary outline
     * and a 4px primary ring at 15%. The label sits above (0.8125rem/600, --c-text-2, 6px gap). Errors take the
     * error colour for the outline and ring, and the helper text gets an icon.
     *
     * This restyles MUI's outlined variant rather than switching to `filled`, so every field (including the ones
     * that pass variant="outlined" explicitly, selects and Autocomplete) gets the same look. The outline is MUI's
     * absolutely positioned fieldset, so its width changes never move the layout. MUI writes its own spacing
     * with physical properties, which the RTL cache mirrors; the overrides here use logical properties only.
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
          fontWeight: 600,
          lineHeight: 1.5,
          color: vars(theme).palette.text.secondary,
          '&.Mui-focused': { color: vars(theme).palette.text.secondary },
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
          fontWeight: 600,
          color: vars(theme).palette.text.secondary,
          '&.Mui-focused': { color: vars(theme).palette.text.secondary },
          '& .MuiFormLabel-asterisk': { color: vars(theme).palette.error.main },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radius.control,
          minHeight: 48,
          backgroundColor: 'var(--c-field)',
          transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
          '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTokens.light.borderStrong,
            ...theme.applyStyles('dark', { borderColor: colorTokens.dark.borderStrong }),
          },
          '&.Mui-focused': {
            backgroundColor: vars(theme).palette.background.paper,
            boxShadow: `0 0 0 4px ${tint('--c-primary', 15)}`,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: vars(theme).palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: vars(theme).palette.error.main },
          '&.Mui-error.Mui-focused': { boxShadow: `0 0 0 4px ${tint('--c-error', 15)}` },
          '&.Mui-disabled': { opacity: 0.7 },
          '&.MuiInputBase-adornedStart': { paddingInlineStart: 14 },
          '&.MuiInputBase-adornedEnd': { paddingInlineEnd: 6 },
          '&.MuiInputBase-multiline': { paddingBlock: 12, paddingInline: 14 },
          '&.MuiInputBase-sizeSmall': { minHeight: 40 },
          // Dark mode: --c-field sits just below the raised surface, so a field in a dialog, drawer or menu
          // would vanish; there it is lifted a step above that surface instead.
          // (Written out rather than through applyStyles, whose `.dark &` would nest the paper inside .dark.)
          '.dark .MuiDialog-paper &:not(.Mui-focused), .dark .MuiDrawer-paper &:not(.Mui-focused), .dark .MuiPopover-paper &:not(.Mui-focused)':
            { backgroundColor: 'color-mix(in srgb, var(--c-text) 8%, var(--c-surface-raised))' },
        }),
        input: ({ theme }) => ({
          paddingBlock: 12.5,
          paddingInline: 14,
          // Edge's built-in reveal and clear buttons would sit next to our own eye toggle.
          '&::-ms-reveal, &::-ms-clear': { display: 'none' },
          '&::placeholder': { color: vars(theme).palette.text.secondary, opacity: 0.85 },
        }),
        inputSizeSmall: { paddingBlock: 8.5, paddingInline: 12 },
        inputAdornedStart: { paddingInlineStart: 0 },
        inputAdornedEnd: { paddingInlineEnd: 0 },
        notchedOutline: {
          top: 0,
          borderColor: 'transparent',
          borderRadius: 'inherit',
          transition: 'border-color 150ms ease-out',
          '& legend': { display: 'none' },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: vars(theme).palette.text.secondary,
          '& .MuiSvgIcon-root': { fontSize: 20 },
          // A trailing action (eye toggle, clear) is a 36px circle inside the box: no negative "edge" margin.
          '& .MuiIconButton-root': { marginInline: 0, width: 36, height: 36, padding: 8 },
        }),
        positionStart: { marginInline: 0, marginInlineEnd: 10 },
        positionEnd: { marginInline: 0, marginInlineStart: 4 },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          marginInline: 0,
          marginBlockStart: 6,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          '&.Mui-error': {
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            color: vars(theme).palette.error.main,
          },
          '&.Mui-error::before': {
            content: '""',
            flexShrink: 0,
            width: 16,
            height: 16,
            marginBlockStart: 2,
            backgroundColor: 'currentColor',
            WebkitMask: `${ERROR_MASK} center / contain no-repeat`,
            mask: `${ERROR_MASK} center / contain no-repeat`,
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: KeyboardArrowDownOutlined,
        // The menu opens below the field, aligned to its inline start (the right: the site is RTL only).
        MenuProps: {
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          transformOrigin: { vertical: 'top', horizontal: 'right' },
          slotProps: { paper: { sx: { maxHeight: 340, mt: 0.75, minWidth: 200 } } },
        },
      },
      styleOverrides: {
        icon: ({ theme }) => ({
          right: 'auto',
          left: 'auto',
          insetInlineEnd: 12,
          fontSize: 20,
          color: vars(theme).palette.text.secondary,
          transition: 'transform 150ms ease-out',
        }),
        iconOpen: { transform: 'rotate(180deg)' },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: { '&.MuiOutlinedInput-root': { paddingBlock: 4.5, paddingInlineStart: 8 } },
        paper: ({ theme }) => ({ boxShadow: MENU_SHADOW, borderRadius: radius.inner, ...raisedSurface(theme) }),
        listbox: { padding: 8 },
        option: {
          borderRadius: 8,
          minHeight: 40,
          '&.Mui-focused': { backgroundColor: tint('--c-primary', 8) },
          '&[aria-selected="true"]': { backgroundColor: 'var(--c-primary-soft)' },
        },
      },
    },
    /* Checkboxes and radios: primary fill, a 6px-radius box (controlIcons.tsx). Slider: 6px track, 20px thumb. */
    MuiCheckbox: {
      defaultProps: {
        icon: createElement(CheckboxIcon),
        checkedIcon: createElement(CheckboxCheckedIcon),
        indeterminateIcon: createElement(CheckboxIndeterminateIcon),
        disableRipple: true,
      },
    },
    MuiRadio: {
      defaultProps: {
        icon: createElement(RadioIcon),
        checkedIcon: createElement(RadioCheckedIcon),
        disableRipple: true,
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .sk-control': {
            boxSizing: 'border-box',
            display: 'inline-grid',
            placeItems: 'center',
            width: 20,
            height: 20,
            borderRadius: 6,
            border: `1.5px solid ${colorTokens.light.borderStrong}`,
            backgroundColor: vars(theme).palette.background.paper,
            color: vars(theme).palette.primary.contrastText,
            transition: 'background-color 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
            ...theme.applyStyles('dark', { borderColor: colorTokens.dark.borderStrong }),
          },
          '& .sk-control--round': { borderRadius: '50%' },
          '& .sk-control--on': {
            borderColor: vars(theme).palette.primary.main,
            backgroundColor: vars(theme).palette.primary.main,
          },
          '& .sk-control__dot': { width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' },
          '&:hover .sk-control:not(.sk-control--on)': { borderColor: vars(theme).palette.primary.main },
          '&.Mui-focusVisible .sk-control': { boxShadow: `0 0 0 4px ${tint('--c-primary', 25)}` },
          '&.Mui-disabled .sk-control': { opacity: 0.5 },
        }),
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 6 },
        rail: ({ theme }) => ({ opacity: 1, backgroundColor: vars(theme).palette.divider }),
        track: { border: 'none' },
        thumb: ({ theme }) => ({
          width: 20,
          height: 20,
          backgroundColor: vars(theme).palette.background.paper,
          border: `2px solid ${vars(theme).palette.primary.main}`,
          boxShadow: '0 1px 3px rgba(16, 24, 22, 0.2)',
          '&::before': { display: 'none' },
          '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 6px ${tint('--c-primary', 16)}` },
          '&.Mui-active': { boxShadow: `0 0 0 8px ${tint('--c-primary', 16)}` },
        }),
        valueLabel: ({ theme }) => ({
          borderRadius: 8,
          fontSize: '0.8125rem',
          fontWeight: 600,
          backgroundColor: vars(theme).palette.text.primary,
          color: vars(theme).palette.background.paper,
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          color: vars(theme).palette.text.secondary,
          '&.Mui-selected': {
            color: vars(theme).palette.primary.main,
            backgroundColor: 'var(--c-primary-soft)',
            '&:hover': { backgroundColor: 'var(--c-primary-soft)' },
          },
        }),
      },
    },
    /*
     * Paper (v2 "Cards and elevation"): no dark-mode overlay image. Low elevations (plain Paper, Card,
     * TableContainer) and outlined Paper are panels: radius 16, a 1px border and the soft card shadow (outlined
     * ones: border only). Menus (8), drawers (16) and dialogs (24) keep their own shadow and radius.
     */
    MuiPaper: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const elevation = ownerState.elevation ?? 1;
          const panel = ownerState.variant === 'outlined' || (elevation >= 1 && elevation <= 3);
          return {
            backgroundImage: 'none',
            ...(panel && !ownerState.square && { borderRadius: radius.card }),
            ...(ownerState.variant !== 'outlined' &&
              elevation >= 1 &&
              elevation <= 3 && {
                boxShadow: 'var(--c-card-shadow)',
                border: `1px solid ${vars(theme).palette.divider}`,
              }),
          };
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: radius.card },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({ borderRadius: radius.card, ...raisedSurface(theme) }),
      },
    },
    /* Dialog anatomy (v2): a 1.125rem/700 title, 24px gutters, actions at the inline end with an 8px gap. */
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.5, paddingBlock: '20px 8px', paddingInline: 24 },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { paddingInline: 24 },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          gap: 8,
          paddingBlock: '12px 20px',
          paddingInline: 24,
          '& > :not(style) ~ :not(style)': { marginInlineStart: 0 },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: radius.inner,
          border: `1px solid ${vars(theme).palette.divider}`,
          boxShadow: MENU_SHADOW,
          ...raisedSurface(theme),
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: { padding: 8 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.9375rem',
          minHeight: 40,
          borderRadius: 8,
          paddingInline: 12,
          '&:hover': { backgroundColor: tint('--c-primary', 8) },
          '&.Mui-focusVisible': { backgroundColor: tint('--c-primary', 12) },
          '&.Mui-selected': { backgroundColor: 'var(--c-primary-soft)' },
          '&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': { backgroundColor: 'var(--c-primary-soft)' },
          // Select options: the chosen one carries a check mark at the inline end.
          '&[role="option"]': { gap: 8 },
          '&[role="option"].Mui-selected': { fontWeight: 600, color: vars(theme).palette.primary.main },
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
        root: { borderRadius: radius.tag, fontWeight: 500 },
      },
    },
    /* Tabs (v2): 600 labels, a 3px primary indicator with rounded block-start corners, a hairline under the row. */
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({ minHeight: 44, boxShadow: `inset 0 -1px 0 ${vars(theme).palette.divider}` }),
        indicator: { height: 3, borderStartStartRadius: 3, borderStartEndRadius: 3 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 44,
          minWidth: 0,
          paddingInline: 16,
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: vars(theme).palette.text.secondary,
          transition: 'color 150ms ease-out, background-color 150ms ease-out',
          '&:hover': { color: vars(theme).palette.text.primary },
          '&.Mui-selected': { color: vars(theme).palette.primary.main },
          '&.Mui-focusVisible': { backgroundColor: tint('--c-primary', 10) },
        }),
      },
    },
    /* Pagination (browse): 40px rounded squares; the current page is filled primary. */
    MuiPaginationItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          '&.Mui-selected': {
            backgroundColor: vars(theme).palette.primary.main,
            color: vars(theme).palette.primary.contrastText,
            '&:hover': { backgroundColor: vars(theme).palette.primary.dark },
          },
        }),
        sizeLarge: { minWidth: 44, height: 44 },
      },
    },
    MuiTable: {
      defaultProps: { size: 'small' },
    },
    /* The header row sits on the section-band surface, so it reads as a header without a heavier rule. */
    MuiTableHead: {
      styleOverrides: {
        root: { '& .MuiTableCell-head': { backgroundColor: 'var(--c-surface-2)' } },
      },
    },
    /*
     * The rows-per-page select is MUI's standard (borderless) input: give it room for the arrow, which the
     * MuiSelect override above moves to the inline end.
     */
    MuiTablePagination: {
      styleOverrides: {
        toolbar: { minHeight: 52, paddingInline: 16 },
        selectLabel: { fontSize: '0.8125rem' },
        displayedRows: { fontSize: '0.8125rem' },
        input: { marginInlineStart: 4, marginInlineEnd: 24 },
        select: {
          paddingBlock: 6,
          paddingInlineStart: 10,
          paddingInlineEnd: '30px !important',
          borderRadius: 8,
          backgroundColor: 'var(--c-field)',
          fontVariantNumeric: 'tabular-nums',
        },
        selectIcon: { insetInlineEnd: 6 },
      },
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
          borderRadius: 8,
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
        root: { borderRadius: radius.inner, alignItems: 'center' },
      },
    },
  },
});
