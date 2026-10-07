"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Chip, Stack } from "@mui/material";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { useToast } from "@/shared/provider/ToastProvider";
import { API_URL, authHeader } from "@/shared/utils/auth";

interface Testimonial {
  _id: string;
  name: string;
  text: string;
  role?: string;
  type: "general" | "property" | "agency";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const TYPE_LABELS: Record<Testimonial["type"], string> = {
  general: "عام",
  property: "عقار",
  agency: "وكالة",
};

export default function TestimonialsModerationPage() {
  const { isDarkMode } = useDarkMode();
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/testimonial?status=pending`, { headers: authHeader() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "فشل في جلب الآراء");
      setTestimonials(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/testimonial/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "فشل في تحديث حالة الرأي");
      setTestimonials((prev) => prev.filter((t) => t._id !== id));
      showToast(status === "approved" ? "تم قبول الرأي" : "تم رفض الرأي", "success");
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء التحديث", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ color: isDarkMode ? "#fff" : undefined }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: "1.5rem", md: "2rem" } }}>
        آراء العملاء
      </Typography>
      <Typography sx={{ mb: 3, color: isDarkMode ? "#cbd5e1" : "#64748b" }}>
        مراجعة الآراء الجديدة وقبولها أو رفضها قبل ظهورها في الموقع
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography sx={{ color: "#dc2626", mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={fetchPending}>إعادة المحاولة</Button>
        </Box>
      ) : testimonials.length === 0 ? (
        <Typography sx={{ textAlign: "center", py: 8 }}>لا توجد آراء بانتظار المراجعة</Typography>
      ) : (
        <Stack spacing={2}>
          {testimonials.map((t) => (
            <Paper
              key={t._id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: isDarkMode ? "1px solid var(--dark-700)" : "1px solid #e2e8f0",
                backgroundColor: isDarkMode ? "var(--dark-800)" : "#fff",
                color: isDarkMode ? "#fff" : undefined,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
                <Typography fontWeight="bold">
                  {t.name}
                  {t.role ? ` — ${t.role}` : ""}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip size="small" label={TYPE_LABELS[t.type] || t.type} />
                  <Typography variant="caption">{new Date(t.createdAt).toLocaleDateString("ar-EG")}</Typography>
                </Box>
              </Box>
              <Typography sx={{ mb: 2, whiteSpace: "pre-wrap" }}>{t.text}</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={updatingId === t._id}
                  onClick={() => updateStatus(t._id, "approved")}
                >
                  قبول
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={updatingId === t._id}
                  onClick={() => updateStatus(t._id, "rejected")}
                >
                  رفض
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
