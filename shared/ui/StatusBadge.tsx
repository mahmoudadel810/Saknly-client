import React from "react";
import Box from "@mui/material/Box";

/**
 * Moderation and activity states. Server facts (server/Model): a property has `isApproved` (boolean) and
 * `isActive` (boolean); denying a property deletes it, so "denied" only occurs for testimonials, whose
 * `status` is "pending" | "approved" | "rejected". Map those with the helpers below.
 */
export type StatusKey = "approved" | "pending" | "denied" | "active" | "inactive";

const STATUS: Record<StatusKey, { label: string; token: string }> = {
  approved: { label: "مقبول", token: "--c-success" },
  pending: { label: "قيد المراجعة", token: "--c-warning" },
  denied: { label: "مرفوض", token: "--c-error" },
  active: { label: "نشط", token: "--c-success" },
  inactive: { label: "غير نشط", token: "--c-text-2" },
};

/** A property's moderation state (`isApproved`). */
export const propertyApprovalStatus = (property: { isApproved?: boolean }): StatusKey =>
  property.isApproved ? "approved" : "pending";

/** A testimonial's `status` ("rejected" reads as denied). */
export const testimonialStatus = (status: string | undefined): StatusKey =>
  status === "approved" ? "approved" : status === "rejected" ? "denied" : "pending";

export interface StatusBadgeProps {
  status: StatusKey;
  /** Overrides the default label, e.g. a feminine form. */
  label?: string;
}

/** A small outlined badge in the state's token colour (text at least 4.6:1 on its 8% tint, both schemes). */
export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { label: defaultLabel, token } = STATUS[status];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        height: 24,
        paddingInline: 1,
        borderRadius: "6px",
        border: "1px solid",
        borderColor: `color-mix(in srgb, var(${token}) 35%, transparent)`,
        bgcolor: `color-mix(in srgb, var(${token}) 8%, var(--c-surface))`,
        color: `var(${token})`,
        fontSize: "0.8125rem",
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <Box component="span" aria-hidden sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />
      {label ?? defaultLabel}
    </Box>
  );
}
