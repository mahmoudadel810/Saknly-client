import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HomeSection from "./HomeSection";

const STEPS = [
  { title: "ابحث وصفِّ النتائج", text: "حسب المدينة ونوع الإعلان والسعر والمساحة وعدد الغرف." },
  { title: "احفظ ما يعجبك", text: "أضف الإعلانات إلى المفضلة لتقارن بينها لاحقًا." },
  { title: "تواصل مع المالك مباشرة", text: "بالهاتف أو واتساب، أو أرسل استفسارًا من صفحة الإعلان." },
];

/** Three true sentences about how the site works. Compact: a numbered list, no illustrations. */
export default function HowItWorks() {
  return (
    <HomeSection id="home-how" title="كيف يعمل سكنلي">
      <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Box component="li" key={step.title} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: "6px",
                display: "grid",
                placeItems: "center",
                bgcolor: "var(--c-primary-soft)",
                color: "primary.main",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h3" variant="h6">
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.text}
              </Typography>
            </Box>
          </Box>
        ))}
      </ol>
    </HomeSection>
  );
}
