import { getImageProps } from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HeroSearchBar from "./HeroSearchBar";

/*
 * The photo (public/images/hero/, credits in the README): hero.webp for wide screens and a 4:5 crop,
 * hero-mobile.webp, for phones. The owner can replace either file in place. The focal point (the sofa and
 * the painting) sits in the middle, so the picture is centred horizontally and kept slightly below centre.
 * object-position is an inline style: the RTL style cache would mirror a horizontal position written in sx.
 */
const PHOTO_ALT = "";
const common = { alt: PHOTO_ALT, sizes: "100vw", quality: 75, priority: true } as const;
const {
  props: { srcSet: desktopSrcSet },
} = getImageProps({ ...common, src: "/images/hero/hero.webp", width: 1920, height: 1280 });
const {
  props: { srcSet: mobileSrcSet, ...imgProps },
} = getImageProps({ ...common, src: "/images/hero/hero-mobile.webp", width: 960, height: 1200 });

/*
 * The scrim: a deep green-black (it echoes the teal in the photo and the Nile-green primary), darkest where the
 * headline sits and at the bottom edge under the panel. White text measures 4.5:1 or better on the brightest
 * pixels behind it (see the v2 hand-off).
 */
const SCRIM =
  "linear-gradient(180deg, rgba(6, 26, 24, 0.62) 0%, rgba(6, 26, 24, 0.66) 45%, rgba(6, 26, 24, 0.58) 75%, rgba(6, 26, 24, 0.72) 100%)";

/** The top of the home page: a full-bleed photo with the page's one h1, and the search panel floating over its bottom edge. */
export default function HeroSection() {
  return (
    <Box component="section" aria-labelledby="home-hero-title" sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          minHeight: { xs: 480, md: 560 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
          // Room at the bottom for the half of the panel that overlaps the photo.
          pt: { xs: 5, md: 6 },
          pb: { xs: 13, sm: 14, md: 12 },
          bgcolor: "var(--c-primary-hover)",
          color: "var(--c-over-photo)",
        }}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          <img
            {...imgProps}
            alt={PHOTO_ALT}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "50% 60%",
              zIndex: -2,
            }}
          />
        </picture>
        <Box aria-hidden sx={{ position: "absolute", inset: 0, zIndex: -1, background: SCRIM }} />

        <Typography
          id="home-hero-title"
          variant="h1"
          sx={{ fontSize: { xs: "1.875rem", sm: "2.25rem", md: "2.5rem" }, maxWidth: "20ch", color: "inherit", textWrap: "balance" }}
        >
          ابحث عن سكنك القادم
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            maxWidth: "52ch",
            textWrap: "balance",
            fontSize: { xs: "1rem", md: "1.125rem" },
            lineHeight: 1.75,
            color: "inherit",
            opacity: 0.92,
          }}
        >
          شقق وفلل ومحلات للبيع والإيجار، وسكن طلابي قرب الجامعات. تواصل مع المالك مباشرة.
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1080,
          mx: "auto",
          px: { xs: 2, md: 3 },
          mt: { xs: -9, sm: -12, md: -10 },
        }}
      >
        <HeroSearchBar />
      </Box>
    </Box>
  );
}
