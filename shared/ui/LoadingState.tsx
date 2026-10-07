"use client";

import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CardGrid from "./CardGrid";

export type LoadingStateProps =
  /** A spinner, for small areas (a panel, a dialog body, a button-sized region). */
  | { variant?: "spinner"; label?: string; compact?: boolean }
  /** Skeleton listing cards in the card grid. */
  | { variant: "cards"; count?: number; label?: string }
  /** Skeleton of the listing detail page: gallery, price block, facts, contact panel. */
  | { variant: "detail"; label?: string }
  /** Skeleton 44px rows outside a table (e.g. a stacked list). Inside a <tbody> use TableRowsSkeleton. */
  | { variant: "rows"; rows?: number; label?: string };

const DEFAULT_LABEL = "جاري التحميل…";

/** Wraps skeletons so assistive technology hears one "loading" status instead of empty boxes. */
function Busy({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box role="status" aria-busy="true" aria-label={label}>
      {children}
    </Box>
  );
}

function CardSkeleton() {
  return (
    <Box
      aria-hidden
      sx={{ border: 1, borderColor: "divider", borderRadius: "10px", overflow: "hidden", bgcolor: "background.paper" }}
    >
      <Skeleton variant="rectangular" animation="wave" sx={{ width: "100%", height: "auto", aspectRatio: "4 / 3" }} />
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="45%" sx={{ fontSize: "1.125rem" }} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="70%" sx={{ fontSize: "0.8125rem" }} />
      </Box>
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4">
        <Skeleton variant="rounded" animation="wave" sx={{ width: "100%", height: "auto", aspectRatio: "16 / 10", borderRadius: "10px" }} />
        <Skeleton variant="text" width="35%" sx={{ fontSize: "1.75rem" }} />
        <Skeleton variant="text" width="70%" sx={{ fontSize: "1.5rem" }} />
        <Skeleton variant="text" width="50%" />
        <div className="flex gap-3">
          <Skeleton variant="rounded" width={96} height={32} />
          <Skeleton variant="rounded" width={96} height={32} />
          <Skeleton variant="rounded" width={96} height={32} />
        </div>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="80%" />
      </div>
      <Skeleton variant="rounded" sx={{ width: "100%", height: 280, borderRadius: "10px" }} />
    </div>
  );
}

/** Skeleton rows for use inside a <TableBody>. */
export function TableRowsSkeleton({ rows = 5, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <TableRow key={row} aria-hidden sx={{ height: 44 }}>
          {Array.from({ length: columns }, (_, col) => (
            <TableCell key={col}>
              <Skeleton variant="text" width={col === 0 ? "70%" : "50%"} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function LoadingState(props: LoadingStateProps) {
  const label = props.label ?? DEFAULT_LABEL;

  switch (props.variant) {
    case "cards":
      return (
        <Busy label={label}>
          <CardGrid>
            {Array.from({ length: props.count ?? 8 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </CardGrid>
        </Busy>
      );
    case "detail":
      return (
        <Busy label={label}>
          <DetailSkeleton />
        </Busy>
      );
    case "rows":
      return (
        <Busy label={label}>
          <Box aria-hidden sx={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: props.rows ?? 5 }, (_, i) => (
              <Box
                key={i}
                sx={{ height: 44, display: "flex", alignItems: "center", borderBottom: 1, borderColor: "divider" }}
              >
                <Skeleton variant="text" width={`${60 + ((i * 13) % 30)}%`} />
              </Box>
            ))}
          </Box>
        </Busy>
      );
    default:
      return (
        <Box
          role="status"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            py: props.compact ? 3 : 8,
          }}
        >
          <CircularProgress size={props.compact ? 24 : 32} aria-hidden />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      );
  }
}
