import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ManageSearchOutlined from "@mui/icons-material/ManageSearchOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import HomeSection from "./HomeSection";

const STEPS: { title: string; text: string; icon: React.ReactNode }[] = [
  {
    title: "ابحث وصفِّ النتائج",
    text: "حسب المدينة ونوع الإعلان والسعر والمساحة وعدد الغرف.",
    icon: <ManageSearchOutlined />,
  },
  { title: "احفظ ما يعجبك", text: "أضف الإعلانات إلى المفضلة لتقارن بينها لاحقًا.", icon: <FavoriteBorderOutlined /> },
  {
    title: "تواصل مع المالك مباشرة",
    text: "بالهاتف أو واتساب، أو أرسل استفسارًا من صفحة الإعلان.",
    icon: <ForumOutlined />,
  },
];

/** Three true sentences about how the site works: numbered cards with an icon, no illustrations. */
export default function HowItWorks() {
  return (
    <HomeSection id="home-how" title="كيف يعمل سكنلي" tone="surface">
      <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3 md:gap-6">
        {STEPS.map((step, index) => (
          <Box
            component="li"
            key={step.title}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: { xs: 2.5, md: 3 },
              borderRadius: "var(--r-card)",
              bgcolor: "background.default",
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Box
                aria-hidden
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--r-inner)",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "var(--c-primary-soft)",
                  color: "primary.main",
                  "& svg": { fontSize: 26 },
                }}
              >
                {step.icon}
              </Box>
              {/* The <ol> already gives the order to assistive tech. */}
              <Box
                component="span"
                aria-hidden
                sx={{
                  minWidth: 28,
                  height: 28,
                  paddingInline: 1,
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "var(--c-accent)",
                  color: "var(--c-on-accent)",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {index + 1}
              </Box>
            </Box>
            <Typography component="h3" variant="h6" sx={{ fontSize: "1.0625rem", fontWeight: 700 }}>
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step.text}
            </Typography>
          </Box>
        ))}
      </ol>
    </HomeSection>
  );
}
