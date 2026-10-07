// A token color that also honours Tailwind opacity modifiers (bg-primary/30) via color-mix.
const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined || opacityValue === "1"
    ? `var(--c-${name})`
    : `color-mix(in srgb, var(--c-${name}) calc(${opacityValue} * 100%), transparent)`;

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
        primary: { DEFAULT: token("primary"), hover: token("primary-hover"), soft: token("primary-soft") },
        "on-primary": token("on-primary"),
        secondary: token("secondary"),
        bg: token("bg"),
        surface: { DEFAULT: token("surface"), 2: token("surface-2"), raised: token("surface-raised") },
        border: { DEFAULT: token("border"), strong: token("border-strong") },
        text: { DEFAULT: token("text"), 2: token("text-2") },
        muted: token("muted"),
        success: token("success"),
        warning: token("warning"),
        error: token("error"),
        info: token("info"),
        student: token("student"),
        field: token("field"),
        accent: { DEFAULT: token("accent"), on: token("on-accent") },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "var(--r-card)",
        inner: "var(--r-inner)",
      },
    },
  },
  plugins: [],
};
