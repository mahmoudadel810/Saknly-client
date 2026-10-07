"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page (the last item). */
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  /** The page's primary action(s), placed on the inline-end side. */
  actions?: React.ReactNode;
}

/** The title block every page starts with (DESIGN-SYSTEM.md, Components). Renders the page's only <h1>. */
export default function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box component="header" sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="مسار التنقل" sx={{ mb: 1, typography: "caption", color: "text.secondary" }}>
          {breadcrumbs.map((crumb, index) =>
            crumb.href && index < breadcrumbs.length - 1 ? (
              <MuiLink
                key={index}
                component={Link}
                href={crumb.href}
                underline="hover"
                color="inherit"
              >
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography
                key={index}
                variant="caption"
                color="text.primary"
                aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: 2,
          rowGap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0, flex: "1 1 320px" }}>
          <Typography variant="h3" component="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: "72ch" }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>{actions}</Box>
        )}
      </Box>
    </Box>
  );
}
