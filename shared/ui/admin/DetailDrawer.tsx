"use client";

import React, { useId } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

/**
 * A side panel at the inline end ("right" is flipped by the RTL theme) for one record's details: a titled
 * header with a close button, a scrolling body and an optional action bar.
 */
export default function DetailDrawer({
  open,
  title,
  onClose,
  actions,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const titleId = useId();
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-labelledby": titleId,
          sx: { width: { xs: "100%", sm: 440 }, maxWidth: "100vw", display: "flex", flexDirection: "column" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2.5,
          minHeight: 64,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography id={titleId} component="h2" sx={{ fontSize: "1.125rem", fontWeight: 600, flex: 1, minWidth: 0 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} aria-label="إغلاق" edge="end">
          <CloseOutlined />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>{children}</Box>
      {actions && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            px: 2.5,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          {actions}
        </Box>
      )}
    </Drawer>
  );
}

/** A label and value pair inside a DetailDrawer. */
export function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography component="dt" variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
        {children}
      </Typography>
    </Box>
  );
}
