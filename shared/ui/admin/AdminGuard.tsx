"use client";

import React from "react";
import Box from "@mui/material/Box";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { useAuth } from "@/app/context/AuthContext";
import EmptyState from "../EmptyState";
import LoadingState from "../LoadingState";

/**
 * The page-level admin check some admin pages already had (middleware.ts guards every /admin route first).
 * It waits for the session instead of flashing "not allowed" at an admin whose profile is still loading.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingState label="جارٍ التحقق من الصلاحيات…" />;
  if (!user || user.role !== "admin") {
    return (
      <Box sx={{ border: 1, borderColor: "divider", borderRadius: "10px", bgcolor: "background.paper" }}>
        <EmptyState
          icon={<LockOutlined />}
          title="هذه الصفحة للمشرفين فقط"
          description="سجّل الدخول بحساب مشرف للوصول إليها."
        />
      </Box>
    );
  }
  return <>{children}</>;
}
