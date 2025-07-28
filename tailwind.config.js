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
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937', // الخلفية الأساسية
          900: '#111827', // الخلفية الأغمق
        },
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "sans-serif"],
        arabic: ["Cairo", "Amiri", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
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
    require("@tailwindcss/forms"),
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
