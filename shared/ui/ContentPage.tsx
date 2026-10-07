import React from "react";
import Box from "@mui/material/Box";
import PageBanner from "./PageBanner";

export interface ContentPageProps {
  title: string;
  description?: React.ReactNode;
  /** "reading" (default): one centred 72ch column. "wide": the full content width, for a form beside a panel. */
  width?: "reading" | "wide";
  /**
   * Set the body on a white panel (the default for "reading"). Pass false when the body brings its own panels,
   * like the FAQ accordion.
   */
  panel?: boolean;
  children: React.ReactNode;
}

/**
 * The layout of the reading pages (about, FAQ, privacy, contact): a tinted PageBanner with the title, then the
 * body capped at 72 characters per line (DESIGN-SYSTEM.md, Page goals) on a white panel.
 */
export default function ContentPage({ title, description, width = "reading", panel, children }: ContentPageProps) {
  const maxWidth = width === "reading" ? "calc(72ch + 48px)" : 1240;
  const onPanel = panel ?? width === "reading";
  return (
    <Box component="main" id="main">
      <PageBanner title={title} description={description} maxWidth={maxWidth} />
      <Box sx={{ maxWidth, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
        {onPanel ? (
          <Box
            sx={{
              p: { xs: 2.5, md: 4 },
              border: 1,
              borderColor: "divider",
              borderRadius: "var(--r-card)",
              bgcolor: "background.paper",
              boxShadow: "var(--c-card-shadow)",
            }}
          >
            {children}
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}

/** A titled block inside a content page. */
export function ContentSection({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <Box component="section" aria-labelledby={headingId} sx={{ "& + &": { mt: 4 } }}>
      <Box component="h2" id={headingId} sx={{ typography: "h5", mb: 1.5 }}>
        {title}
      </Box>
      <Box sx={{ typography: "body1", color: "text.secondary", "& p + p": { mt: 1.5 } }}>{children}</Box>
    </Box>
  );
}
