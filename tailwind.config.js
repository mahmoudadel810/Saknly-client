const twColors = require("tailwindcss/colors");

// A token color that also honours Tailwind opacity modifiers (bg-primary/30) via color-mix.
const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined || opacityValue === "1"
    ? `var(--c-${name})`
    : `color-mix(in srgb, var(--c-${name}) calc(${opacityValue} * 100%), transparent)`;

// legacy aliases — remove when pages are redesigned (Phase 3).
// The numbered shades that pages still use (bg-primary-600, text-secondary-900, bg-dark-800 …). The primary
// scale now follows the brand green; the others keep their pre-redesign values, which are Tailwind's own scales.
const legacy = {
  primary: {
    50: "#E3F0EE",
    100: "#C7E2DE",
    200: "#9DCBC4",
    300: "#6DB0A7",
    400: "#3E958B",
    500: "#1A7A70",
    600: "#0E5E57",
    700: "#0A4A44",
    800: "#083D38",
    900: "#06302C",
    950: "#041F1C",
  },
  secondary: twColors.slate,
  success: twColors.green,
  warning: twColors.amber,
  danger: twColors.red,
  dark: (({ 950: _unused, ...rest }) => rest)(twColors.gray),
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  // MUI CssBaseline is the only reset; app/globals.css keeps the few base rules layout utilities need.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        // Design tokens (DESIGN-SYSTEM.md), defined as --c-* in app/globals.css for light and dark.
        primary: { DEFAULT: token("primary"), hover: token("primary-hover"), soft: token("primary-soft"), ...legacy.primary },
        "on-primary": token("on-primary"),
        secondary: { DEFAULT: token("secondary"), ...legacy.secondary },
        bg: token("bg"),
        surface: { DEFAULT: token("surface"), 2: token("surface-2"), raised: token("surface-raised") },
        border: { DEFAULT: token("border"), strong: token("border-strong") },
        text: { DEFAULT: token("text"), 2: token("text-2") },
        muted: token("muted"),
        success: { DEFAULT: token("success"), ...legacy.success },
        warning: { DEFAULT: token("warning"), ...legacy.warning },
        error: token("error"),
        info: token("info"),
        student: token("student"),
        field: token("field"),
        accent: { DEFAULT: token("accent"), on: token("on-accent") },
        danger: legacy.danger,
        dark: legacy.dark,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        card: "var(--r-card)",
        inner: "var(--r-inner)",
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.5s ease-in-out",
        "fade-in-down": "fadeInDown 0.5s ease-in-out",
        "slide-in-right": "slideInRight 0.3s ease-in-out",
        "slide-in-left": "slideInLeft 0.3s ease-in-out",
        "bounce-in": "bounceIn 0.6s ease-in-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      screens: {
        xs: "475px",
        "3xl": "1600px",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".rtl": {
          direction: "rtl",
        },
        ".ltr": {
          direction: "ltr",
        },
        ".text-shadow": {
          textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
        },
        ".text-shadow-lg": {
          textShadow: "4px 4px 8px rgba(0,0,0,0.2)",
        },
        ".rtl\\:text-right": {
          textAlign: "right",
        },
        ".rtl\\:text-left": {
          textAlign: "left",
        },
        ".rtl\\:ml-auto": {
          marginLeft: "auto",
        },
        ".rtl\\:mr-auto": {
          marginRight: "auto",
        },
        ".rtl\\:flex-row-reverse": {
          flexDirection: "row-reverse",
        },
        ".rtl\\:space-x-reverse": {
          "--tw-space-x-reverse": "1",
        },
        ".rtl\\:border-r-0": {
          borderRight: "0",
        },
        ".rtl\\:border-l-0": {
          borderLeft: "0",
        },
        ".rtl\\:rounded-r-none": {
          borderTopRightRadius: "0",
          borderBottomRightRadius: "0",
        },
        ".rtl\\:rounded-l-none": {
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
