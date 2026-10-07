import React from "react";

/*
 * Checkbox and radio glyphs for the theme (DESIGN-SYSTEM.md v2, "Inputs"): a 20px box with a 6px radius, or a
 * 20px circle, outlined at rest and filled with the primary colour when checked. They are markup only; the
 * MuiCheckbox and MuiRadio overrides in theme.ts style `.sk-control` (rest, hover, focus, disabled, error).
 */

const CHECK = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 10 17l9-10" />
  </svg>
);

const DASH = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M6 12h12" />
  </svg>
);

export const CheckboxIcon = () => <span aria-hidden className="sk-control" />;
export const CheckboxCheckedIcon = () => <span aria-hidden className="sk-control sk-control--on">{CHECK}</span>;
export const CheckboxIndeterminateIcon = () => <span aria-hidden className="sk-control sk-control--on">{DASH}</span>;
export const RadioIcon = () => <span aria-hidden className="sk-control sk-control--round" />;
export const RadioCheckedIcon = () => (
  <span aria-hidden className="sk-control sk-control--round sk-control--on">
    <span className="sk-control__dot" />
  </span>
);
