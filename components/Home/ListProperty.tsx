"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddHomeWorkOutlined from "@mui/icons-material/AddHomeWorkOutlined";

/*
 * The scrim runs from the inline start, where the text sits, to clear at the inline end so the building shows.
 * The site is always RTL, so the start is the right-hand side: "to left". It is an inline style because the
 * RTL style cache would mirror a direction written in sx.
 */
const SCRIM =
  "linear-gradient(to left, rgba(6, 26, 24, 0.9) 0%, rgba(6, 26, 24, 0.78) 40%, rgba(6, 26, 24, 0.2) 80%, rgba(6, 26, 24, 0.05) 100%)";

/**
 * The one "list your property" band: a photo of an apartment block behind the pitch and one sand-coloured
 * action. The link goes straight to the upload page; the middleware sends a signed-out visitor to
 * /login?redirect=/uploadProperty and back again after signing in.
 */
export default function ListProperty() {
  return (
    <Box component="section" aria-labelledby="home-list-title" sx={{ py: { xs: 5, md: 8 }, bgcolor: "background.default" }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            position: "relative",
            isolation: "isolate",
            overflow: "hidden",
            borderRadius: "var(--r-card)",
            minHeight: { xs: 360, md: 340 },
            display: "flex",
            alignItems: { xs: "flex-end", md: "center" },
            bgcolor: "var(--c-primary-hover)",
            color: "var(--c-over-photo)",
            boxShadow: "var(--c-card-shadow)",
          }}
        >
          <Image
            src="/images/hero/list-building.webp"
            alt=""
            fill
            sizes="(min-width: 1240px) 1192px, 100vw"
            style={{ objectFit: "cover", objectPosition: "30% 70%", zIndex: -2 }}
          />
          <Box aria-hidden sx={{ position: "absolute", inset: 0, zIndex: -1 }} style={{ background: SCRIM }} />

          <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 560 }}>
            <Typography
              id="home-list-title"
              variant="h2"
              sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, lineHeight: 1.35, color: "inherit" }}
            >
              عندك عقار للبيع أو الإيجار؟
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: { xs: "1rem", md: "1.0625rem" }, lineHeight: 1.75, opacity: 0.92 }}>
              أضف إعلانك بالصور والسعر والموقع. يراجعه فريق سكنلي ثم يُنشر ليصل إلى الباحثين في مدينتك.
            </Typography>
            <Button
              component={Link}
              href="/uploadProperty"
              variant="contained"
              size="large"
              startIcon={<AddHomeWorkOutlined aria-hidden />}
              sx={{
                mt: 3,
                minHeight: 48,
                px: 3,
                bgcolor: "var(--c-accent)",
                color: "var(--c-on-accent)",
                "&:hover": { bgcolor: "color-mix(in srgb, var(--c-accent) 88%, var(--c-over-photo))" },
              }}
            >
              أضف إعلانك
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
