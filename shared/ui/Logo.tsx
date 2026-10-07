import React from "react";
import Box from "@mui/material/Box";

/**
 * The Saknly mark: a roof line over an arched door on a primary tile. It reads as "home" and "door" without
 * the house-with-chimney cliché, and stays legible at 24px (the strokes are 2px or more at that size). The
 * tile uses the primary token and the drawing the on-primary token, so the mark keeps its contrast in light
 * and dark mode.
 *
 * The geometry is shared with public/brand/logo.svg, app/icon.svg, app/apple-icon.png and
 * public/brand/og.png (they use the light hex values, because a standalone file cannot read the page's CSS
 * variables). Change them together.
 */
export const LOGO_MARK = {
  viewBox: "0 0 32 32",
  tile: { x: 1, y: 1, width: 30, height: 30, rx: 8 },
  roof: "M7 15.2 16 8l9 7.2",
  door: "M11.5 25v-5.5a4.5 4.5 0 0 1 9 0V25z",
  knob: { cx: 18.1, cy: 21.4, r: 1.15 },
} as const;

export function LogoMark({ size = 32, title }: { size?: number; title?: string }) {
  const g = LOGO_MARK;
  return (
    <svg
      width={size}
      height={size}
      viewBox={g.viewBox}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect {...g.tile} fill="var(--c-primary)" />
      <path
        d={g.roof}
        fill="none"
        stroke="var(--c-on-primary)"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={g.door} fill="var(--c-on-primary)" />
      <circle {...g.knob} fill="var(--c-primary)" />
    </svg>
  );
}

export interface LogoProps {
  /** "mark": the tile alone. "full" (default): the tile plus the Arabic wordmark. */
  variant?: "mark" | "full";
  /** Height of the mark in px; the wordmark scales with it. */
  size?: number;
  /** Adds the small Latin "Saknly" under the Arabic wordmark. */
  showLatin?: boolean;
  /** A second line under the wordmark instead of the Latin name (e.g. "لوحة الإدارة"). */
  subtitle?: React.ReactNode;
}

/**
 * The Saknly logo. The wordmark is real HTML text in the page font (IBM Plex Sans Arabic 700), not SVG
 * text, so it renders in the brand font and inherits the current text colour. When the logo sits inside a
 * link, the visible "سكنلي" text names the link; the mark itself is decorative.
 */
export default function Logo({ variant = "full", size = 32, showLatin = false, subtitle }: LogoProps) {
  if (variant === "mark") return <LogoMark size={size} title="سكنلي" />;

  const secondLine = subtitle ?? (showLatin ? "Saknly" : null);
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: `${Math.round(size * 0.3)}px` }}>
      <LogoMark size={size} />
      <Box component="span" sx={{ display: "inline-flex", flexDirection: "column", minWidth: 0 }}>
        <Box
          component="span"
          sx={{ fontSize: `${(size * 0.6) / 16}rem`, fontWeight: 700, lineHeight: 1.15, color: "inherit" }}
        >
          سكنلي
        </Box>
        {secondLine && (
          <Box
            component="span"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "text.secondary",
              letterSpacing: subtitle ? 0 : "0.02em",
            }}
          >
            {secondLine}
          </Box>
        )}
      </Box>
    </Box>
  );
}
