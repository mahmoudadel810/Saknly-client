"use client";

import { useEffect } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ErrorState from "./ErrorState";

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  /** Where the secondary action goes: home for public pages, the dashboard for admin. */
  homeHref?: string;
  homeLabel?: string;
  /** False inside a shell that already renders <main> (admin). */
  landmark?: boolean;
}

/**
 * The body of an app/…/error.tsx boundary: plain Arabic, a retry that re-renders the segment, and a way out.
 * The error itself is logged, never shown (it may hold a stack or a server message).
 */
export default function RouteError({
  error,
  reset,
  title = "حدث خطأ أثناء عرض الصفحة",
  description = "حاول مرة أخرى. إن تكرر الخطأ، ارجع إلى الصفحة الرئيسية.",
  homeHref = "/",
  homeLabel = "الصفحة الرئيسية",
  landmark = true,
}: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box component={landmark ? "main" : "div"} id={landmark ? "main" : undefined} sx={{ maxWidth: 640, mx: "auto", px: 2, py: { xs: 5, md: 9 } }}>
      <Box
        sx={{
          pb: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: "var(--r-card)",
          bgcolor: "background.paper",
          boxShadow: "var(--c-card-shadow)",
        }}
      >
        <ErrorState title={title} description={description} onRetry={reset} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: -3 }}>
          <Button component={Link} href={homeHref} variant="text">
            {homeLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
