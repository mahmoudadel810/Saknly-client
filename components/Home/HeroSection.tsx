import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HeroSearchBar from "./HeroSearchBar";

/** The top of the home page: the page's one h1 and the search form. Nothing decorative. */
export default function HeroSection() {
  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      sx={{ bgcolor: "var(--c-primary-soft)", borderBottom: 1, borderColor: "divider" }}
    >
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 4, md: 7 }, pb: { xs: 4, md: 6 } }}>
        <Typography
          id="home-hero-title"
          variant="h1"
          sx={{ fontSize: { xs: "1.625rem", md: "2.25rem" }, maxWidth: "24ch" }}
        >
          ابحث عن سكنك القادم
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, mb: { xs: 3, md: 4 }, color: "text.secondary", maxWidth: "60ch" }}>
          شقق وفلل ومحلات للبيع والإيجار، وسكن طلابي، في مدن المنوفية وطنطا. تواصل مع المالك مباشرة.
        </Typography>
        <HeroSearchBar />
      </Box>
    </Box>
  );
}
