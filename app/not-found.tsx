import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import EmptyState from "@/shared/ui/EmptyState";

export default function NotFound() {
  return (
    <Box component="main" id="main" sx={{ maxWidth: 640, mx: "auto", px: 2, py: { xs: 6, md: 10 } }}>
      <Box component="h1" sx={{ typography: "h3", textAlign: "center" }}>
        الصفحة غير موجودة
      </Box>
      <EmptyState
        icon={<SearchOffOutlined />}
        title="لم نجد هذه الصفحة"
        description="ربما تغيّر الرابط أو حُذف الإعلان. ابحث في العقارات المتاحة أو ارجع إلى الصفحة الرئيسية."
        action={
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
            <Button component={Link} href="/properties" variant="contained">
              تصفّح العقارات
            </Button>
            <Button component={Link} href="/" variant="outlined">
              الصفحة الرئيسية
            </Button>
          </Box>
        }
      />
    </Box>
  );
}
