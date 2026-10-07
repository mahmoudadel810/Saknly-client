import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";

/** The public 404: one white panel with what happened and the two ways on (browse, home). */
export default function NotFound() {
  return (
    <Box component="main" id="main" sx={{ maxWidth: 640, mx: "auto", px: 2, py: { xs: 5, md: 9 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 1.5,
          px: { xs: 2.5, md: 6 },
          py: { xs: 5, md: 7 },
          border: 1,
          borderColor: "divider",
          borderRadius: "var(--r-card)",
          bgcolor: "background.paper",
          boxShadow: "var(--c-card-shadow)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 72,
            height: 72,
            mb: 1,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: "var(--c-primary-soft)",
            "& svg": { fontSize: 34 },
          }}
        >
          <SearchOffOutlined />
        </Box>
        <Typography variant="caption" className="num" sx={{ color: "var(--c-muted)", fontWeight: 600 }}>
          خطأ 404
        </Typography>
        <Typography variant="h3" component="h1">
          الصفحة غير موجودة
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "46ch" }}>
          ربما تغيّر الرابط أو حُذف الإعلان. ابحث في العقارات المتاحة أو ارجع إلى الصفحة الرئيسية.
        </Typography>
        <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
          <Button component={Link} href="/properties" variant="contained">
            تصفّح العقارات
          </Button>
          <Button component={Link} href="/" variant="outlined">
            الصفحة الرئيسية
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
