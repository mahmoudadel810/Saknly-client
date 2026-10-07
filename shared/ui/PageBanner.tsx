import React from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import PageHeader, { type PageHeaderProps } from "./PageHeader";

export interface PageBannerProps extends Omit<PageHeaderProps, "tone"> {
  /**
   * "tint" (default): a calm green-tinted band, for content and account pages.
   * "photo": a slim photo band with a green-black scrim, for browse (DESIGN-SYSTEM.md v2, "Photography leads").
   */
  variant?: "tint" | "photo";
  /** The width of the inner column; match the page body below it. */
  maxWidth?: number | string;
  /** Extra content under the header inside the band (e.g. tabs). */
  children?: React.ReactNode;
  /**
   * Leave 32px at the bottom of the band for a panel that floats over its edge (the page pulls the panel up
   * with a matching negative margin), like the search panel on the home hero.
   */
  overlap?: boolean;
  /** A logo or avatar at the inline start of the header (the agency page). */
  media?: React.ReactNode;
}

/*
 * The photo (public/images/hero/list-building.webp, credits in CREDITS.md) under a scrim dark enough that
 * white text measures 4.5:1 or better on its brightest pixels. object-position is an inline style: the RTL
 * style cache would mirror a horizontal position written in sx.
 */
const SCRIM = "linear-gradient(180deg, rgba(6, 26, 24, 0.62) 0%, rgba(6, 26, 24, 0.72) 100%)";

/**
 * A full-width band that carries the page's PageHeader (title, description, breadcrumbs, actions). It sits
 * directly under the public header; the page body follows on the warm page background.
 */
export default function PageBanner({
  variant = "tint",
  maxWidth = 1240,
  children,
  overlap = false,
  media,
  ...header
}: PageBannerProps) {
  const photo = variant === "photo";
  const bottom = photo ? { xs: 4, md: 5 } : children ? 0 : { xs: 3, md: 4 };
  return (
    <Box
      sx={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderBottom: photo ? 0 : 1,
        borderColor: "divider",
        bgcolor: photo ? "var(--c-primary-hover)" : "color-mix(in srgb, var(--c-primary-soft) 70%, var(--c-surface))",
      }}
    >
      {photo && (
        <>
          <Image
            src="/images/hero/list-building.webp"
            alt=""
            fill
            sizes="100vw"
            quality={70}
            priority
            style={{ objectFit: "cover", objectPosition: "50% 45%", zIndex: -2 }}
          />
          <Box aria-hidden sx={{ position: "absolute", inset: 0, zIndex: -1, background: SCRIM }} />
        </>
      )}
      <Box
        sx={{
          maxWidth,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pt: photo ? { xs: 4, md: 5 } : { xs: 3, md: 4 },
          pb: overlap ? { xs: 8, md: 9 } : bottom,
          "& > header": { mb: children ? 2 : 0 },
        }}
      >
        {media ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, md: 3 },
              "& > header": { flex: 1, minWidth: 0, mb: 0 },
            }}
          >
            <Box sx={{ flexShrink: 0 }}>{media}</Box>
            <PageHeader {...header} tone={photo ? "onPhoto" : "default"} />
          </Box>
        ) : (
          <PageHeader {...header} tone={photo ? "onPhoto" : "default"} />
        )}
        {children}
      </Box>
    </Box>
  );
}
