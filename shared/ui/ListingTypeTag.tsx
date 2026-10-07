import React from "react";
import Box from "@mui/material/Box";
import type { PropertyCategoryValue } from "@/shared/constants/property";

/** The server's category discriminator (server/Model/PropertyModel.js): sale, rent or student. */
const TAG: Record<PropertyCategoryValue, { label: string; token: string }> = {
  sale: { label: "للبيع", token: "--c-primary" },
  rent: { label: "للإيجار", token: "--c-info" },
  student: { label: "سكن طلابي", token: "--c-student" },
};

export const listingTypeLabel = (category: string | undefined): string | null =>
  category && category in TAG ? TAG[category as PropertyCategoryValue].label : null;

export interface ListingTypeTagProps {
  category: PropertyCategoryValue | string | undefined;
}

/**
 * A quiet outlined tag (DESIGN-SYSTEM.md, Color tokens): token text and a 1px tinted border on the surface
 * colour, never a filled block. The surface background keeps it legible on top of a photo. Unknown categories
 * render nothing.
 */
export default function ListingTypeTag({ category }: ListingTypeTagProps) {
  if (!category || !(category in TAG)) return null;
  const { label, token } = TAG[category as PropertyCategoryValue];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        paddingInline: 1,
        borderRadius: "6px",
        border: "1px solid",
        borderColor: `color-mix(in srgb, var(${token}) 45%, transparent)`,
        bgcolor: "var(--c-surface)",
        color: `var(${token})`,
        fontSize: "0.8125rem",
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}
