"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import EmptyState from "@/shared/ui/EmptyState";
import PageHeader from "@/shared/ui/PageHeader";

/** Unknown admin URLs stay inside the admin shell, with a way back. */
export default function AdminNotFound() {
  return (
    <>
      <PageHeader title="الصفحة غير موجودة" breadcrumbs={[{ label: "لوحة الإدارة", href: "/admin/dashboard" }, { label: "صفحة غير موجودة" }]} />
      <Box sx={{ border: 1, borderColor: "divider", borderRadius: "10px", bgcolor: "background.paper" }}>
        <EmptyState
          icon={<SearchOffOutlined />}
          title="لا توجد صفحة بهذا العنوان في لوحة الإدارة"
          description="ربما تغيّر الرابط أو كُتب بشكل خاطئ. اختر صفحة من القائمة الجانبية أو عُد إلى لوحة المعلومات."
          action={
            <Button component={Link} href="/admin/dashboard" variant="contained">
              العودة إلى لوحة المعلومات
            </Button>
          }
        />
      </Box>
    </>
  );
}
