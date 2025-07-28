"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableContainer,
  useMediaQuery,
  Theme,
  CircularProgress,
} from "@mui/material";
import {
  Email,
  Bookmark,
  Logout,
  Home,
  Favorite,
  Check,
  HourglassTop,
  Phone,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useRouter } from "next/navigation";
import { useDarkMode } from "../context/DarkModeContext";

export default function UserProfilePage() {
  const authContext = useContext(AuthContext);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const { isDarkMode } = useDarkMode();
  
  if (!authContext) {
    return <Typography>Loading...</Typography>;
  }

  const { user, logout } = authContext;
  const { wishlist, removeFromWishlist, removeAllFromWishlist } = useWishlist();
  const router = useRouter();

  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Only show properties where owner._id === user._id
  const myProperties = user && user._id
    ? userProperties.filter(
        (p) => p.owner && (p.owner._id === user._id || p.owner === user._id)
      )
    : [];

  useEffect(() => {
    const fetchUserProperties = async () => {
      setLoadingProperties(true);
      try {
        const token = localStorage.getItem("token");
        const tokenPrefix = process.env.NEXT_PUBLIC_TOKEN_PREFIX || 'Bearer';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/properties/allProperties`, {
          headers: {
            Authorization: `${tokenPrefix} ${token}`,
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUserProperties(data.data);
        }
      } catch (err) {
        setUserProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchUserProperties();
  }, []);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const tokenPrefix = process.env.NEXT_PUBLIC_TOKEN_PREFIX || 'Bearer';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/properties/pending`, {
          headers: {
            Authorization: `${tokenPrefix} ${token}`,
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPendingCount(data.data.length);
        } else {
          setPendingCount(0);
        }
      } catch {
        setPendingCount(0);
      }
    };
    fetchPendingCount();
  }, []);

  // Calculate stats
  const savedCount = wishlist.length;
  const acceptedCount = myProperties.filter(p => p.isApproved).length;

  const performanceStats = [
    { 
      title: "المحفوظات", 
      value: savedCount, 
      icon: <Bookmark sx={{ color: "#3b82f6" }} />,
      color: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
      borderColor: "#3b82f6"
    },
    { 
      title: "قيد المراجعة", 
      value: pendingCount, 
      icon: <HourglassTop sx={{ color: "#f59e0b" }} />,
      color: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
      borderColor: "#f59e0b"
    },
    { 
      title: "المقبولة", 
      value: acceptedCount, 
      icon: <Check sx={{ color: "#22c55e" }} />,
      color: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
      borderColor: "#22c55e"
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - myProperties.length) : 0;

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDarkMode ? "#111827" : "#f1f5f9",
        fontFamily: "Cairo, sans-serif",
        direction: "rtl",
        py: 4,
        px: { xs: 1, sm: 2 },
        color: isDarkMode ? "#f1f5f9" : undefined,
      }}
    >
      <Box sx={{ 
        maxWidth: "1400px", 
        mx: "auto", 
        width: "100%",
        mb: 4,
        textAlign: "center"
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            color: isDarkMode ? "#f1f5f9" : "#1e293b",
            mb: 1,
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" }
          }}
        >
          ملف المستخدم
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: isDarkMode ? "#cbd5e1" : "#64748b", 
            maxWidth: "600px", 
            mx: "auto",
            fontSize: { xs: "0.9rem", sm: "1rem" }
          }}
        >
          إدارة معلومات حسابك وعقاراتك والمحفوظات
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" }, 
        gap: 3,
        maxWidth: "1400px",
        mx: "auto",
        width: "100%"
      }}>
        {/* Profile Section */}
        <Box sx={{ 
          flex: 1, 
          width: "100%", 
          maxWidth: { md: "33%" } 
        }}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            height: "100%",
            border: isDarkMode ? "1px solid #374151" : "1px solid #e2e8f0",
            background: isDarkMode ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          }}>
            <CardContent sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              p: { xs: 2, sm: 3 } 
            }}>
              <Avatar
                src={user?.avatar?.url}
                alt={user?.firstName}
                sx={{ 
                  width: { xs: 100, sm: 140 }, 
                  height: { xs: 100, sm: 140 }, 
                  mb: 3, 
                  bgcolor: "#3b82f6", 
                  fontSize: { xs: 40, sm: 60 },
                  border: isDarkMode ? "3px solid #1f2937" : "3px solid #eff6ff",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)"
                }}
              >
                {user?.firstName?.[0]}
              </Avatar>
              
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: isDarkMode ? "#f1f5f9" : "#1e293b" }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Chip 
                  label={user?.userName} 
                  sx={{ 
                    mb: 2,
                    background: isDarkMode ? "#1e293b" : "#eff6ff",
                    color: isDarkMode ? "#60a5fa" : "#2563eb",
                    fontWeight: 600,
                    fontSize: isMobile ? "0.8rem" : "0.9rem"
                  }} 
                />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    color: isDarkMode ? "#cbd5e1" : "#475569",
                    fontSize: { xs: "0.9rem", sm: "1rem" } 
                  }}
                >
                  <Email sx={{ fontSize: "1.2rem", color: isDarkMode ? "#cbd5e1" : "#64748b" }} />
                  {user?.email}
                </Typography>
                {user?.phone && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      color: isDarkMode ? "#cbd5e1" : "#475569",
                      fontSize: { xs: "0.9rem", sm: "1rem" } 
                    }}
                  >
                    <Phone sx={{ fontSize: "1.2rem", color: isDarkMode ? "#cbd5e1" : "#64748b" }} />
                    {user.phone}
                  </Typography>
                )}
              </Box>
              
              {/* Buttons */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 1.5, 
                width: "100%", 
                mt: 3 
              }}>
                
                <Button
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    borderColor: isDarkMode ? "#374151" : "#e2e8f0",
                    color: isDarkMode ? "#f1f5f9" : "#334155",
                    fontWeight: 600,
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
                      borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                    }
                  }}
                  startIcon={<Favorite sx={{ ml: 1 }} />}
                  onClick={() => router.push('/wishlist')}
                >
                  العقارات المحفوظة
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    border: isDarkMode ? "1px solid #7f1d1d" : "1px solid #fee2e2",
                    color: isDarkMode ? "#f87171" : "#ef4444",
                    fontWeight: 600,
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    mt: 1,
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#7f1d1d" : "#fef2f2",
                      borderColor: isDarkMode ? "#b91c1c" : "#fecaca",
                    }
                  }}
                  startIcon={<Logout sx={{ ml: 1 }} />}
                  onClick={handleLogout}
                >
                  تسجيل الخروج
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Dashboard Section */}
        <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Performance Stats */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            border: isDarkMode ? "1px solid #374151" : "1px solid #e2e8f0",
            background: isDarkMode ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: isDarkMode ? "#f1f5f9" : "#1e293b" }}>
                إحصائيات الأداء
              </Typography>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: { 
                  xs: "1fr", 
                  sm: "repeat(2, 1fr)", 
                  md: "repeat(3, 1fr)" 
                }, 
                gap: 3 
              }}>
                {performanceStats.map((stat, index) => (
                  <Card
                    key={index}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: isDarkMode ? "#1e293b" : stat.color,
                      border: isDarkMode ? "1px solid #334155" : `1px solid ${stat.borderColor}33`,
                      boxShadow: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: isDarkMode ? "0 10px 20px rgba(0,0,0,0.2)" : "0 10px 20px rgba(0, 0, 0, 0.1)",
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      mb: 1.5
                    }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: isDarkMode ? "#111827" : "#ffffff99",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isDarkMode ? "0 4px 6px rgba(0,0,0,0.15)" : "0 4px 6px rgba(0, 0, 0, 0.05)"
                      }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: isDarkMode ? "#f1f5f9" : "#1e293b" }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: isDarkMode ? "#cbd5e1" : "#334155",
                        fontSize: { xs: "0.9rem", sm: "1rem" } 
                      }}
                    >
                      {stat.title}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* User Properties Table */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            border: isDarkMode ? "1px solid #374151" : "1px solid #e2e8f0",
            background: isDarkMode ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                mb: 3
              }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: isDarkMode ? "#f1f5f9" : "#1e293b" }}>
                  عقاراتي
                </Typography>
                <Button
                  variant="contained"
                  sx={{ 
                    borderRadius: 2, 
                    px: 3,
                    py: 1,
                    background: isDarkMode ? "linear-gradient(135deg, #2563eb 0%, #1e293b 100%)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    boxShadow: isDarkMode ? "0 4px 6px rgba(30,41,59,0.3)" : "0 4px 6px rgba(59, 130, 246, 0.3)",
                    "&:hover": {
                      background: isDarkMode ? "linear-gradient(135deg, #1e293b 0%, #2563eb 100%)" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: isDarkMode ? "0 6px 10px rgba(30,41,59,0.4)" : "0 6px 10px rgba(59, 130, 246, 0.4)",
                    }
                  }}
                  startIcon={<Home sx={{ ml: 1 }} />}
                  onClick={() => router.push('/uploadProperty')}
                >
                  إضافة عقار جديد
                </Button>
              </Box>
              
              {loadingProperties ? (
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  py: 4 
                }}>
                  <CircularProgress size={40} sx={{ color: isDarkMode ? "#60a5fa" : "#3b82f6" }} />
                </Box>
              ) : myProperties.length === 0 ? (
                <Box sx={{ 
                  textAlign: "center", 
                  py: 4,
                  color: isDarkMode ? "#cbd5e1" : "#64748b"
                }}>
                  <Home sx={{ fontSize: 64, mb: 2, color: isDarkMode ? "#374151" : "#cbd5e1" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    لا توجد عقارات
                  </Typography>
                  <Typography>
                    لم تقم بإضافة أي عقارات بعد. ابدأ بإضافة عقارك الأول الآن!
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer 
                    sx={{ 
                      width: "100%", 
                      overflowX: "auto",
                      border: isDarkMode ? "1px solid #374151" : "1px solid #e2e8f0",
                      borderRadius: 2,
                      maxHeight: 400,
                      background: isDarkMode ? "#1f2937" : undefined,
                    }}
                  >
                    <Table 
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        minWidth: isMobile ? 600 : "100%",
                        "& .MuiTableCell-root": {
                          textAlign: "right",
                          padding: isMobile ? "12px 8px" : "16px",
                          color: isDarkMode ? "#f1f5f9" : undefined,
                          borderBottom: isDarkMode ? "1px solid #374151" : undefined,
                        }
                      }}
                    >
                      <TableHead sx={{ backgroundColor: isDarkMode ? "#1f2937" : "#f1f5f9" }}>
                        <TableRow>
                          <TableCell sx={{ minWidth: 180, fontWeight: 700, color: isDarkMode ? "#f1f5f9" : "#334155" }}>العنوان</TableCell>
                          <TableCell sx={{ minWidth: 120, fontWeight: 700, color: isDarkMode ? "#f1f5f9" : "#334155" }}>الحالة</TableCell>
                          <TableCell sx={{ minWidth: 120, fontWeight: 700, color: isDarkMode ? "#f1f5f9" : "#334155" }}>التاريخ</TableCell>
                          <TableCell sx={{ minWidth: 100, fontWeight: 700, color: isDarkMode ? "#f1f5f9" : "#334155" }}>الإجراءات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myProperties
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((property, idx) => {
                            let status = "قيد المراجعة";
                            let statusColor = "warning";
                            let date = property.createdAt;
                            
                            if (property.isApproved) {
                              status = "مقبولة";
                              statusColor = "success";
                              date = property.approvedAt || property.createdAt;
                            }
                            
                            return (
                              <TableRow 
                                key={property._id || idx}
                                sx={{ 
                                  '&:nth-of-type(even)': { backgroundColor: isDarkMode ? '#111827' : '#f8fafc' },
                                  '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }
                                }}
                              >
                                <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                                  {property.title}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={status}
                                    color={statusColor as "success" | "warning"}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{ 
                                      minWidth: 100,
                                      fontWeight: 700,
                                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                      background: isDarkMode && statusColor === "success" ? "#166534" : isDarkMode && statusColor === "warning" ? "#78350f" : undefined,
                                      color: isDarkMode ? "#f1f5f9" : undefined,
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {date ? new Date(date).toLocaleDateString('ar-EG') : "-"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                      borderColor: isDarkMode ? "#374151" : "#cbd5e1",
                                      color: isDarkMode ? "#f1f5f9" : "#334155",
                                      "&:hover": {
                                        backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9"
                                      }
                                    }}
                                    onClick={() => router.push(`/properties/${property._id}`)}
                                  >
                                    التفاصيل
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={4} />
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Custom Arabic Pagination */}
                  <Box 
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      mt: 3,
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? 2 : 0
                    }}
                  >
                    
                    
                    <Box>
                      <Button
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        sx={{ 
                          minWidth: 40, 
                          mx: 0.5,
                          fontWeight: 600,
                          color: isDarkMode ? "#f1f5f9" : "#334155",
                          "&:disabled": { color: isDarkMode ? "#374151" : "#cbd5e1" }
                        }}
                      >
                        السابق
                      </Button>
                      <Button
                        disabled={(page + 1) * rowsPerPage >= myProperties.length}
                        onClick={() => setPage(page + 1)}
                        sx={{ 
                          minWidth: 40, 
                          mx: 0.5,
                          fontWeight: 600,
                          color: isDarkMode ? "#f1f5f9" : "#334155",
                          "&:disabled": { color: isDarkMode ? "#374151" : "#cbd5e1" }
                        }}
                      >
                        التالي
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Box sx={{ 
        maxWidth: "1400px", 
        mx: "auto", 
        width: "100%", 
        mt: 5, 
        textAlign: "center", 
        color: isDarkMode ? "#cbd5e1" : "#64748b",
        fontSize: "0.9rem"
      }}>
      </Box>
    </Box>
  );
}