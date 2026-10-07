"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import { useAuth } from "@/app/context/AuthContext";
import PropertyFormForSale from "@/shared/components/PropertyFormForSale";
import PageBanner from "@/shared/ui/PageBanner";

export default function UploadPropertyPage() {
  const { user } = useAuth();
  return (
    <Box component="main" id="main">
      <PageBanner
        maxWidth={880}
        title="أضف عقارك"
        description="املأ بيانات العقار وأضف صوره. يراجع فريق سكنلي كل إعلان قبل نشره، ثم يظهر في نتائج البحث."
        actions={
          user?.role === "admin" ? (
            <Button
              component={Link}
              href="/admin/import-properties"
              variant="outlined"
              startIcon={<UploadFileOutlined />}
              sx={{ bgcolor: "background.paper" }}
            >
              استيراد من ملف Word
            </Button>
          ) : undefined
        }
      />
      <Box sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        <PropertyFormForSale />
      </Box>
    </Box>
  );
}
