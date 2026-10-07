"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Pagination,
} from "@mui/material";
import Link from "next/link";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { API_URL, authHeader } from "@/shared/utils/auth";

interface PropertyInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "in-progress" | "responded" | "closed";
  isRead?: boolean;
  createdAt: string;
  property?: { _id: string; title?: string } | null;
}

const STATUS_LABELS: Record<PropertyInquiry["status"], { label: string; color: "info" | "warning" | "success" | "default" }> = {
  new: { label: "جديد", color: "info" },
  "in-progress": { label: "قيد المتابعة", color: "warning" },
  responded: { label: "تم الرد", color: "success" },
  closed: { label: "مغلق", color: "default" },
};

const LIMIT = 10;

export default function PropertyInquiriesSection() {
  const { isDarkMode } = useDarkMode();
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_URL}/property-inquiry/get-all-property-inquiries?page=${page}&limit=${LIMIT}`,
          { headers: authHeader() }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "فشل في جلب استفسارات العقارات");
        setInquiries(Array.isArray(data.data) ? data.data : []);
        setTotal(data.pagination?.total || 0);
      } catch (err: any) {
        setError(err.message || "حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const cellSx = { color: isDarkMode ? "#fff" : undefined, borderColor: isDarkMode ? "var(--dark-700)" : undefined };
  const headSx = { ...cellSx, fontWeight: "bold", backgroundColor: isDarkMode ? "var(--dark-700)" : "#f8fafc" };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, md: 3 },
        overflow: "hidden",
        mb: 3,
        border: isDarkMode ? "1px solid var(--dark-700)" : "1px solid #e2e8f0",
        backgroundColor: isDarkMode ? "var(--dark-800)" : "#fff",
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography fontWeight="bold">استفسارات العقارات</Typography>
        <Chip label={`الإجمالي: ${total}`} size="small" />
      </Box>
      <TableContainer sx={{ maxHeight: "70vh" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={headSx}>العقار</TableCell>
              <TableCell align="center" sx={headSx}>الاسم</TableCell>
              <TableCell align="center" sx={headSx}>التواصل</TableCell>
              <TableCell align="center" sx={headSx}>الرسالة</TableCell>
              <TableCell align="center" sx={headSx}>الحالة</TableCell>
              <TableCell align="center" sx={headSx}>التاريخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, ...cellSx }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#dc2626" }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, ...cellSx }}>
                  لا توجد استفسارات على العقارات
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => {
                const status = STATUS_LABELS[inq.status] || STATUS_LABELS.new;
                return (
                  <TableRow key={inq._id} hover>
                    <TableCell align="center" sx={cellSx}>
                      {inq.property?._id ? (
                        <Link href={`/properties/${inq.property._id}`} style={{ color: "#2563eb" }}>
                          {inq.property.title || "عرض العقار"}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>{inq.name}</TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <div>{inq.email}</div>
                      <div dir="ltr">{inq.phone}</div>
                    </TableCell>
                    <TableCell align="center" sx={{ ...cellSx, maxWidth: 320, whiteSpace: "pre-wrap" }}>
                      {inq.message}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      {new Date(inq.createdAt).toLocaleDateString("ar-EG")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Box>
      )}
    </Paper>
  );
}
