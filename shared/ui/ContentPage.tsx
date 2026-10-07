import React from "react";
import Box from "@mui/material/Box";
import PageHeader from "./PageHeader";

export interface ContentPageProps {
  title: string;
  description?: React.ReactNode;
  /** "reading" (default): one centred 72ch column. "wide": the full content width, for a form beside a panel. */
  width?: "reading" | "wide";
  children: React.ReactNode;
}

/**
 * The layout of the reading pages (about, FAQ, privacy, contact): page gutter, PageHeader and a body capped at
 * 72 characters per line (DESIGN-SYSTEM.md, Page goals).
 */
export default function ContentPage({ title, description, width = "reading", children }: ContentPageProps) {
  return (
    <Box
      component="main"
      id="main"
      sx={{
        maxWidth: width === "reading" ? "calc(72ch + 48px)" : 1240,
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <PageHeader title={title} description={description} />
      {children}
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
