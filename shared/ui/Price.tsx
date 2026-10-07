import React from "react";
import Box from "@mui/material/Box";

/** Western digits with thousands separators, the same on server and client (never the runtime locale). */
const NUMBER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const formatNumber = (value: number): string => NUMBER.format(value);

export const isMonthly = (category: string | undefined) => category === "rent";

/** Plain-text price for labels and aria text: "1,500,000 ج.م" or "4,000 ج.م / شهر". */
export const formatPrice = (amount: number, category?: string): string =>
  `${formatNumber(amount)} ج.م${isMonthly(category) ? " / شهر" : ""}`;

const SIZES = {
  card: { amount: "1.125rem", unit: "0.8125rem" },
  detail: { amount: "1.75rem", unit: "1rem" },
  table: { amount: "0.8125rem", unit: "0.8125rem" },
} as const;

export interface PriceProps {
  amount: number | null | undefined;
  /** The listing category; "rent" adds "/ شهر". */
  category?: string;
  size?: keyof typeof SIZES;
  /** "inverse": every part takes the surrounding colour, for the price chip on a card photo. */
  tone?: "default" | "inverse";
}

/**
 * The listing price, the one bold element on cards and the detail page (DESIGN-SYSTEM.md, Direction):
 * tabular Western digits, then "ج.م", then "/ شهر" for rent. A missing amount renders a dash.
 */
export default function Price({ amount, category, size = "card", tone = "default" }: PriceProps) {
  const s = SIZES[size];
  const inverse = tone === "inverse";
  const unitColor = inverse || size === "table" ? "inherit" : "text.secondary";
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return (
      <Box component="span" sx={{ color: inverse ? "inherit" : "text.secondary", fontSize: s.unit }}>
        —
      </Box>
    );
  }
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 0.5, color: inverse ? "inherit" : "text.primary" }}
    >
      <Box
        component="span"
        sx={{
          fontSize: s.amount,
          fontWeight: size === "table" ? 600 : 700,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.3,
        }}
      >
        {formatNumber(amount)}
      </Box>
      <Box component="span" sx={{ fontSize: s.unit, fontWeight: 500, color: unitColor }}>
        ج.م
      </Box>
      {isMonthly(category) && (
        <Box component="span" sx={{ fontSize: s.unit, color: unitColor }}>
          / شهر
        </Box>
      )}
    </Box>
  );
}
