"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxOutlined from "@mui/icons-material/InboxOutlined";

export interface EmptyStateProps {
  /** Says what is empty: "لا توجد عقارات محفوظة". */
  title: string;
  /** One line: why it is empty, or what to do next. */
  description?: React.ReactNode;
  /** An outlined icon; defaults to an inbox. */
  icon?: React.ReactNode;
  /** One optional action, e.g. a Button linking to browse. */
  action?: React.ReactNode;
  /** Less padding, for table bodies and small panels. */
  compact?: boolean;
}

export default function EmptyState({ title, description, icon, action, compact = false }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1,
        py: compact ? 4 : 8,
        px: 2,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: compact ? 52 : 64,
          height: compact ? 52 : 64,
          mb: 0.5,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: "var(--c-primary-soft)",
          "& svg": { fontSize: compact ? 26 : 30 },
        }}
      >
        {icon ?? <InboxOutlined />}
      </Box>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "48ch" }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}
