"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddHomeWorkOutlined from "@mui/icons-material/AddHomeWorkOutlined";

/**
 * The one "list your property" band. The link goes straight to the upload page; the middleware sends a
 * signed-out visitor to /login?redirect=/uploadProperty and back again after signing in.
 */
export default function ListProperty() {
  return (
    <Box component="section" aria-labelledby="home-list-title" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            p: { xs: 2.5, md: 4 },
            border: 1,
            borderColor: "divider",
            borderRadius: "10px",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography id="home-list-title" variant="h2" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
              عندك عقار للبيع أو الإيجار؟
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: "60ch" }}>
              أضف إعلانك بالصور والسعر والموقع. يراجعه فريق سكنلي ثم يُنشر ليصل إلى الباحثين في مدينتك.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/uploadProperty"
            variant="contained"
            size="large"
            startIcon={<AddHomeWorkOutlined aria-hidden />}
            sx={{ flexShrink: 0, height: 48, px: 3 }}
          >
            أضف إعلانك
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
