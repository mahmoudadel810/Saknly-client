"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Chip, IconButton, Tooltip } from "@mui/material";
import { Email, Person, Subject, Message, DateRange, Visibility, MailOutline, Check } from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import { useDarkMode } from "@/app/context/DarkModeContext";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const InquiriesPage = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/delete-contact/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `${process.env.TOKEN_PREFIX}${token}`,
        },
      });
      if (!res.ok) throw new Error("فشل في حذف الاستفسار");
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
    } catch (err: any) {
      setDeleteError(err.message || "حدث خطأ أثناء الحذف");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/get-all-contacts`, {
          headers: {
            Authorization: `${process.env.TOKEN_PREFIX}${token}`,
          },
        });
        if (!res.ok) throw new Error("فشل في جلب الاستفسارات");
        const data = await res.json();
        setInquiries(data.data || []);
      } catch (err: any) {
        setError(err.message || "حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const getStatusColor = (date: string) => {
    const inquiryDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - inquiryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "#22c55e"; // success-500 - today
    if (diffDays <= 3) return "#f59e0b"; // warning-500 - recent
    return "#64748b"; // secondary-500 - old
  };

  const getStatusText = (date: string) => {
    const inquiryDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - inquiryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "جديد";
    if (diffDays <= 3) return "حديث";
    return "قديم";
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      background: isDarkMode ? 'var(--dark-900)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      color: isDarkMode ? '#fff' : undefined,
      p: { xs: 1, sm: 2, md: 4 }
    }}>
      {/* Header Section */}
      <Box sx={{ 
        mb: { xs: 3, md: 4 }, 
        textAlign: "center", 
        p: { xs: 3, md: 4 }, 
        background: isDarkMode ? 'var(--dark-800)' : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
        borderRadius: { xs: 2, md: 3 }, 
        color: isDarkMode ? '#fff' : '#fff',
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
        border: isDarkMode ? '1px solid var(--dark-700)' : "1px solid rgba(255, 255, 255, 0.1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode ? 'none' : "radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }
      }}>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: "1.5rem", sm: "1.875rem", md: "2.25rem" }, 
              mb: { xs: 1, md: 2 },
              textShadow: isDarkMode ? 'none' : "2px 2px 4px rgba(0,0,0,0.1)",
              color: isDarkMode ? '#fff' : undefined,
            }}
          >
            الاستفسارات المرسلة
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" }, 
              color: isDarkMode ? '#fff' : "#dbeafe",
              opacity: 0.95,
              textShadow: isDarkMode ? 'none' : "1px 1px 2px rgba(0,0,0,0.1)"
            }}
          >
            عرض وإدارة جميع الاستفسارات المرسلة من صفحة التواصل
          </Typography>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: 2, 
            mt: 2,
            flexWrap: "wrap"
          }}>
            <Chip 
              label={`إجمالي الاستفسارات: ${inquiries.length}`}
              sx={{ 
                backgroundColor: isDarkMode ? 'var(--dark-700)' : "rgba(255, 255, 255, 0.2)",
                color: isDarkMode ? '#fff' : "#fff",
                fontWeight: "bold",
                backdropFilter: "blur(10px)"
              }}
            />
          </Box>
        </Box>
      </Box>


      {/* Main Table */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: { xs: 2, md: 3 }, 
          overflow: "hidden", 
          mb: 3, 
          border: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #e2e8f0", 
          backgroundColor: isDarkMode ? 'var(--dark-800)' : "#fff", 
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          position: "relative"
        }}
      >
        <TableContainer sx={{ maxHeight: "70vh", background: isDarkMode ? 'var(--dark-800)' : undefined }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell 
                  align="center" 
                  sx={{ 
                    background: isDarkMode ? 'var(--dark-700)' : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    color: isDarkMode ? '#fff' : "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderBottom: isDarkMode ? '2px solid var(--dark-700)' : "2px solid #475569"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <Person sx={{ fontSize: "1rem" }} />
                    اسم المرسل
                  </Box>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    background: isDarkMode ? 'var(--dark-700)' : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    color: isDarkMode ? '#fff' : "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderBottom: isDarkMode ? '2px solid var(--dark-700)' : "2px solid #475569"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <Email sx={{ fontSize: "1rem" }} />
                    البريد الإلكتروني
                  </Box>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    background: isDarkMode ? 'var(--dark-700)' : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    color: isDarkMode ? '#fff' : "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderBottom: isDarkMode ? '2px solid var(--dark-700)' : "2px solid #475569"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <Subject sx={{ fontSize: "1rem" }} />
                    الموضوع
                  </Box>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    background: isDarkMode ? 'var(--dark-700)' : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    color: isDarkMode ? '#fff' : "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderBottom: isDarkMode ? '2px solid var(--dark-700)' : "2px solid #475569"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <Message sx={{ fontSize: "1rem" }} />
                    الرسالة
                  </Box>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    background: isDarkMode ? 'var(--dark-700)' : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    color: isDarkMode ? '#fff' : "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderBottom: isDarkMode ? '2px solid var(--dark-700)' : "2px solid #475569"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <DateRange sx={{ fontSize: "1rem" }} />
                    التاريخ والحالة
                  </Box>
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    background: isDarkMode ? 'var(--dark-700)' : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                    color: isDarkMode ? '#fff' : "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderBottom: isDarkMode ? '2px solid var(--dark-700)' : "2px solid #475569"
                  }}
                >
                  الإجراءات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <CircularProgress size={48} sx={{ color: isDarkMode ? '#fff' : "#3b82f6" }} />
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#fff' : "#64748b" }}>
                        جاري تحميل الاستفسارات...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      gap: 2,
                      p: 4,
                      backgroundColor: isDarkMode ? 'var(--error-900)' : "#fee2e2",
                      borderRadius: 2,
                      border: isDarkMode ? '1px solid var(--error-700)' : "1px solid #fca5a5"
                    }}>
                      <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : "#dc2626", fontWeight: "bold" }}>
                        ❌ خطأ في تحميل البيانات
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#fff' : "#b91c1c" }}>
                        {error}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      gap: 2,
                      p: 4,
                      backgroundColor: isDarkMode ? 'var(--dark-700)' : "#f1f5f9",
                      borderRadius: 2,
                      border: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #cbd5e1"
                    }}>
                      <Typography variant="h6" sx={{ color: isDarkMode ? '#fff' : "#64748b", fontWeight: "bold" }}>
                        �� لا يوجد استفسارات
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#fff' : "#94a3b8" }}>
                        لم يتم العثور على أي استفسارات مرسلة حتى الآن
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((inq, index) => (
                  <TableRow 
                    key={inq._id}
                    sx={{ 
                      "&:nth-of-type(odd)": { backgroundColor: isDarkMode ? 'var(--dark-800)' : "#f8fafc" },
                      "&:hover": { 
                        backgroundColor: isDarkMode ? 'var(--dark-700)' : "#f1f5f9",
                        transform: "scale(1.002)",
                        transition: "all 0.2s ease"
                      },
                      transition: "all 0.2s ease"
                    }}
                  >
                    <TableCell align="center" sx={{ 
                      borderBottom: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #e2e8f0",
                      py: 2
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                        <Typography variant="body1" sx={{ fontWeight: "500", color: isDarkMode ? '#fff' : "#1e293b" }}>
                          {inq.name}
                        </Typography>
                        <Person sx={{ fontSize: "1rem", color: isDarkMode ? '#fff' : "#64748b" }} />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      borderBottom: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #e2e8f0",
                      py: 2
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#fff' : "#475569", fontFamily: "monospace" }}>
                          {inq.email}
                        </Typography>
                        <Email sx={{ fontSize: "1rem", color: isDarkMode ? '#fff' : "#64748b" }} />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      borderBottom: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #e2e8f0",
                      py: 2
                    }}>
                      <Tooltip title={inq.subject} arrow>
                        <Typography variant="body1" sx={{ 
                          fontWeight: "500", 
                          color: isDarkMode ? '#fff' : "#334155",
                          maxWidth: "200px"
                        }}>
                          {truncateText(inq.subject, 30)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      borderBottom: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #e2e8f0",
                      py: 2
                    }}>
                      <Tooltip title={inq.message} arrow>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#fff' : "#64748b",
                          maxWidth: "250px",
                          lineHeight: 1.4
                        }}>
                          {truncateText(inq.message, 50)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      borderBottom: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #e2e8f0",
                      py: 2
                    }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#fff' : "#475569", fontWeight: "500" }}>
                          {new Date(inq.createdAt).toLocaleDateString("ar-EG")}
                        </Typography>
                        <Chip 
                          label={getStatusText(inq.createdAt)}
                          size="small"
                          sx={{ 
                            backgroundColor: getStatusColor(inq.createdAt),
                            color: '#fff',
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            border: isDarkMode ? '1px solid var(--dark-700)' : undefined
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      borderBottom: isDarkMode ? '1px solid var(--dark-700)' : "1px solid #e2e8f0",
                      py: 2
                    }}>
                      <Tooltip title="تواصل مع المرسل" arrow>
                        <IconButton
                          component="a"
                          href={`mailto:${inq.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: isDarkMode ? '#fff' : "#3b82f6" }}
                          size="small"
                        >
                          <MailOutline sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تمت المعالجة" arrow>
                        <span>
                          <IconButton
                            onClick={() => handleDelete(inq._id)}
                            sx={{ color: isDarkMode ? '#fff' : "#22c55e", ml: 1 }}
                            size="small"
                            disabled={deletingId === inq._id}
                          >
                            {deletingId === inq._id ? <CircularProgress size={16} /> : <Check sx={{ fontSize: "1rem" }} />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {deleteError && (
        <Box sx={{ color: "#dc2626", textAlign: "center", mt: 2 }}>{deleteError}</Box>
      )}
    </Box>
  );
};

export default InquiriesPage;