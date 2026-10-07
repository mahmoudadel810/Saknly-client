import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

// eslint-config-next 15 ships eslintrc-style configs; FlatCompat turns them into flat config entries.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "public/**", "next-env.d.ts"]),

  // React, React hooks, jsx-a11y, import and the Next.js rules (@next/next/core-web-vitals).
  ...compat.extends("next/core-web-vitals"),

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser } },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // The automatic JSX runtime: no `import React` needed for JSX.
  pluginReact.configs.flat["jsx-runtime"],

  {
    settings: { react: { version: "detect" } },
    rules: {
      // Types come from TypeScript; Next.js sets attributes such as `jsx` and `global` on <style>.
      "react/prop-types": "off",
      "react/no-unknown-property": "off",
      // Legacy code still carries these; they are reported but do not fail `next build`.
      // New code must not add any (DESIGN-SYSTEM.md, Rules for implementers).
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-require-imports": "warn",
      "react/no-unescaped-entities": "warn",
      "react/display-name": "warn",
      "no-empty": "warn",
    },
  },

  // Node-side files: config files and the edge middleware.
  {
    files: ["*.config.{js,mjs,cjs,ts,mts}", "middleware.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
]);
