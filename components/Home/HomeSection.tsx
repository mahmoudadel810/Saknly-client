import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface HomeSectionProps {
  id: string;
  title: string;
  description?: React.ReactNode;
  /** A link or button on the inline-end side of the heading (e.g. "عرض الكل"). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** One home-page band: an h2 with an optional one-line description and action, then the content. */
export default function HomeSection({ id, title, description, action, children }: HomeSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Box component="section" aria-labelledby={titleId} sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            columnGap: 2,
            rowGap: 1,
            mb: 3,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography id={titleId} variant="h2" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: "64ch" }}>
                {description}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
        {children}
      </Box>
    </Box>
  );
}
