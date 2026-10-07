"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";

export interface ErrorStateProps {
  /** Plain Arabic wording that names what failed: "تعذر تحميل العقارات". */
  title?: string;
  /** Optional plain-language hint. Never pass a server message or an error object. */
  description?: string;
  onRetry?: () => void;
  /** Disables the retry button and shows a spinner while the retry runs. */
  retrying?: boolean;
  retryLabel?: string;
  compact?: boolean;
}

/**
 * A load failure with a retry. It takes strings only, so a raw server message or a stack trace cannot reach
 * the screen through it.
 */
export default function ErrorState({
  title = "تعذر تحميل البيانات",
  description = "تحقق من اتصالك بالإنترنت ثم أعد المحاولة.",
  onRetry,
  retrying = false,
  retryLabel = "إعادة المحاولة",
  compact = false,
}: ErrorStateProps) {
  return (
    <Box
      role="alert"
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
      <Box aria-hidden sx={{ color: "error.main", display: "flex", "& svg": { fontSize: compact ? 32 : 40 } }}>
        <ErrorOutlineOutlined />
      </Box>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "48ch" }}>
          {description}
        </Typography>
      )}
      {onRetry && (
        <Button
          variant="outlined"
          onClick={onRetry}
          disabled={retrying}
          startIcon={retrying ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ mt: 1 }}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );
}
