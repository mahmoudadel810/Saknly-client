"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FixedSizeList as List } from "react-window";
import { useDebounce } from "use-debounce";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useAuth } from "../../../context/AuthContext";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useDarkMode } from "@/app/context/DarkModeContext";

interface User {
  _id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  isConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDocs: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
}

const fetchUsers = async (page = 1, limit = 20, search = "", token: string): Promise<UsersResponse> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `${process.env.TOKEN_PREFIX}${token}`;
  }

  const res = await fetch(`/api/users?page=${page}&limit=${limit}&search=${search}`, {
    headers
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
};

const UsersPage = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["users", page, debouncedSearch],
    queryFn: () => fetchUsers(page, 8 , debouncedSearch, token || ""),
    placeholderData: (previousData) => previousData,
    enabled: !!token,
  });

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.userName[0]?.toUpperCase() || '?';
  };

  const getAvatarColor = (role: string) => {
    const colors = {
      admin: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', // danger-600 to danger-700
      moderator: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', // warning-600 to warning-700
      user: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', // primary-600 to primary-700
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = data?.users[index];
    if (!user) return null;

    return (
      <Paper 
        style={style} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, md: 3 },
          borderRadius: 4,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
            borderColor: '#3b82f6',
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <Avatar 
            sx={{ 
              background: getAvatarColor(user.role),
              width: { xs: 40, md: 52 },
              height: { xs: 40, md: 52 },
              fontSize: { xs: '1rem', md: '1.3rem' },
              fontWeight: 700,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {getUserInitials(user)}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: { xs: '0.95rem', md: '1.15rem' },
                  fontWeight: 600,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.userName
                }
              </Typography>
              {user.role === 'admin' && (
                <AdminPanelSettingsIcon sx={{ color: '#dc2626', fontSize: 18 }} />
              )}
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.8rem', md: '0.9rem' },
                color: '#64748b',
                fontWeight: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, md: 1.5 },
          flexWrap: 'wrap',
          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          alignItems: 'center',
          mt: { xs: 1, sm: 0 }
        }}>
          <Chip 
            label={user.role === 'admin' ? 'أدمن' : user.role === 'moderator' ? 'مشرف' : 'مستخدم'} 
            sx={{ 
              fontSize: { xs: '0.7rem', md: '0.775rem' },
              fontWeight: 600,
              borderRadius: 2,
              px: 0.5,
              backgroundColor: user.role === 'admin' ? '#fee2e2' : user.role === 'moderator' ? '#fef3c7' : '#dbeafe',
              color: user.role === 'admin' ? '#dc2626' : user.role === 'moderator' ? '#d97706' : '#2563eb',
              border: `1px solid ${user.role === 'admin' ? '#fecaca' : user.role === 'moderator' ? '#fde68a' : '#bfdbfe'}`,
              '& .MuiChip-icon': {
                fontSize: '0.8rem',
                color: 'inherit'
              }
            }}
            icon={user.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
          />
          
          <Chip 
            label={user.status === 'active' ? 'نشط' : user.status === 'inactive' ? 'غير نشط' : 'معلق'} 
            sx={{ 
              fontSize: { xs: '0.7rem', md: '0.775rem' },
              fontWeight: 600,
              borderRadius: 2,
              px: 0.5,
              backgroundColor: user.status === 'active' ? '#dcfce7' : user.status === 'inactive' ? '#fee2e2' : '#fef3c7',
              color: user.status === 'active' ? '#16a34a' : user.status === 'inactive' ? '#dc2626' : '#d97706',
              border: `1px solid ${user.status === 'active' ? '#bbf7d0' : user.status === 'inactive' ? '#fecaca' : '#fde68a'}`,
            }}
          />
          
          {user.isConfirmed && (
            <Chip 
              label="مؤكد" 
              icon={<VerifiedUserIcon />}
              sx={{ 
                fontSize: { xs: '0.7rem', md: '0.775rem' },
                fontWeight: 600,
                borderRadius: 2,
                px: 0.5,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                border: '1px solid #16a34a',
                '& .MuiChip-icon': {
                  color: '#ffffff',
                  fontSize: '0.8rem'
                }
              }}
            />
          )}
        </Box>
      </Paper>
    );
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode ? 'var(--dark-900)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
      }}>
        <Paper sx={{ 
          p: 4, 
          borderRadius: 4,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: 400,
          width: '100%',
          background: isDarkMode ? 'var(--dark-800)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid #e2e8f0',
          color: isDarkMode ? '#fff' : undefined,
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: isDarkMode ? '#fff' : '#dc2626',
            fontSize: '1.1rem'
          }}>
            غير مصرح لك بالوصول لهذه الصفحة
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: "auto", 
      p: { xs: 2, sm: 3, md: 4 },
      minHeight: '100vh',
      background: isDarkMode ? 'var(--dark-900)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      color: isDarkMode ? '#fff' : undefined,
    }}>
      <Paper sx={{ 
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        background: isDarkMode ? 'var(--dark-800)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid #e2e8f0',
        color: isDarkMode ? '#fff' : undefined,
        mb: 4,
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 2, 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              color: isDarkMode ? '#fff' : '#0f172a',
              letterSpacing: '-0.02em',
              background: isDarkMode ? undefined : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: isDarkMode ? undefined : 'text',
              WebkitTextFillColor: isDarkMode ? undefined : 'transparent',
              textShadow: isDarkMode ? undefined : '0 4px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            إدارة المستخدمين
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 400,
              color: isDarkMode ? '#fff' : '#64748b',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            إدارة وعرض جميع المستخدمين في النظام بتصميم عصري ومتطور
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن المستخدمين..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: isDarkMode ? '#fff' : '#64748b' }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              backgroundColor: isDarkMode ? 'var(--dark-700)' : '#f8fafc',
              border: isDarkMode ? '1px solid var(--dark-600)' : '1px solid #e2e8f0',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '1rem',
              color: isDarkMode ? '#fff' : undefined,
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--dark-600)' : '#f1f5f9',
                borderColor: isDarkMode ? 'var(--dark-500)' : '#cbd5e1',
              },
              '&.Mui-focused': {
                backgroundColor: isDarkMode ? 'var(--dark-600)' : '#ffffff',
                borderColor: isDarkMode ? '#fff' : '#3b82f6',
                boxShadow: isDarkMode ? '0 0 0 3px #fff' : '0 0 0 3px rgba(59, 130, 246, 0.1)',
                color: isDarkMode ? '#fff' : undefined,
              },
              '& fieldset': {
                border: 'none',
              }
            },
            '& input': {
              padding: '16px 14px',
              color: isDarkMode ? '#fff' : undefined,
            }
          }}
        />

        {error && (
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            textAlign: 'center',
            backgroundColor: isDarkMode ? 'var(--error-900)' : '#fee2e2',
            borderColor: isDarkMode ? 'var(--error-700)' : '#fecaca',
            border: isDarkMode ? '1px solid var(--error-700)' : '1px solid',
            borderRadius: 3,
            boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1)',
            color: isDarkMode ? '#fff' : undefined,
          }}>
            <Typography sx={{ 
              fontSize: { xs: '0.9rem', md: '1rem' }, 
              fontWeight: 600,
              color: isDarkMode ? '#fff' : '#dc2626'
            }}>
              حدث خطأ في تحميل البيانات
            </Typography>
          </Paper>
        )}

        {isLoading ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            color: isDarkMode ? '#fff' : undefined,
          }}>
            <CircularProgress 
              size={48} 
              thickness={4} 
              sx={{ 
                color: isDarkMode ? '#fff' : '#3b82f6',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }} 
            />
            <Typography sx={{ 
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 500,
              color: isDarkMode ? '#fff' : '#64748b'
            }}>
              جاري التحميل...
            </Typography>
          </Box>
        ) : data?.users.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 8 },
            color: isDarkMode ? '#fff' : '#64748b'
          }}>
            <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5, color: isDarkMode ? '#fff' : '#cbd5e1' }} />
            <Typography sx={{ 
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 500,
              color: isDarkMode ? '#fff' : undefined,
            }}>
              لا توجد مستخدمين
            </Typography>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                {data && data.users.map((user, idx) => (
                  <Row key={user._id} index={idx} style={{ color: isDarkMode ? '#fff' : undefined }} />
                ))}
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ 
                borderRadius: 4, 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                background: isDarkMode ? 'var(--dark-800)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid #e2e8f0',
                color: isDarkMode ? '#fff' : undefined,
                overflow: 'hidden'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: isDarkMode ? 'var(--dark-700)' : '#f1f5f9',
                      '& th': {
                        borderBottom: isDarkMode ? '2px solid var(--dark-600)' : '2px solid #e2e8f0',
                        color: isDarkMode ? '#fff' : '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        letterSpacing: '0.01em',
                        py: 2,
                      }
                    }}>
                      <TableCell align="right">اسم المستخدم</TableCell>
                      <TableCell align="right">الحالة</TableCell>
                      <TableCell align="right">آخر تسجيل دخول</TableCell>
                      <TableCell align="right">النشاط الأخير</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data && data.users.map((user) => (
                      <TableRow key={user._id} sx={{
                        '&:hover': {
                          backgroundColor: isDarkMode ? 'var(--dark-800)' : '#f8fafc',
                          '& td': {
                            borderColor: isDarkMode ? 'var(--dark-700)' : '#cbd5e1',
                          }
                        },
                        '& td': {
                          borderBottom: isDarkMode ? '1px solid var(--dark-700)' : '1px solid #f1f5f9',
                          py: 2,
                          color: isDarkMode ? '#fff' : undefined,
                        }
                      }}>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              background: getAvatarColor(user.role), 
                              width: 40, 
                              height: 40, 
                              fontSize: '0.9rem', 
                              fontWeight: 700,
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              border: '2px solid rgba(255, 255, 255, 0.2)',
                              color: isDarkMode ? '#fff' : undefined,
                            }}>
                              {getUserInitials(user)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                color: isDarkMode ? '#fff' : '#0f172a',
                                fontSize: '0.95rem',
                                mb: 0.5
                              }}>
                                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.userName}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: isDarkMode ? '#fff' : '#64748b',
                                fontSize: '0.8rem'
                              }}>
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              label={user.role === 'admin' ? 'أدمن' : user.role === 'moderator' ? 'مشرف' : 'مستخدم'} 
                              size="small"
                              sx={{ 
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: 2,
                                backgroundColor: isDarkMode
                                  ? user.role === 'admin' ? 'var(--error-900)' : user.role === 'moderator' ? 'var(--warning-900)' : 'var(--primary-900)'
                                  : user.role === 'admin' ? '#fee2e2' : user.role === 'moderator' ? '#fef3c7' : '#dbeafe',
                                color: isDarkMode ? '#fff' : user.role === 'admin' ? '#dc2626' : user.role === 'moderator' ? '#d97706' : '#2563eb',
                                border: isDarkMode
                                  ? `1px solid ${user.role === 'admin' ? 'var(--error-700)' : user.role === 'moderator' ? 'var(--warning-700)' : 'var(--primary-700)'}`
                                  : `1px solid ${user.role === 'admin' ? '#fecaca' : user.role === 'moderator' ? '#fde68a' : '#bfdbfe'}`,
                              }}
                            />
                            <Chip 
                              label={user.status === 'active' ? 'نشط' : user.status === 'inactive' ? 'غير نشط' : 'معلق'} 
                              size="small"
                              sx={{ 
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: 2,
                                backgroundColor: isDarkMode
                                  ? user.status === 'active' ? 'var(--success-900)' : user.status === 'inactive' ? 'var(--error-900)' : 'var(--warning-900)'
                                  : user.status === 'active' ? '#dcfce7' : user.status === 'inactive' ? '#fee2e2' : '#fef3c7',
                                color: isDarkMode ? '#fff' : user.status === 'active' ? '#16a34a' : user.status === 'inactive' ? '#dc2626' : '#d97706',
                                border: isDarkMode
                                  ? `1px solid ${user.status === 'active' ? 'var(--success-700)' : user.status === 'inactive' ? 'var(--error-700)' : 'var(--warning-700)'}`
                                  : `1px solid ${user.status === 'active' ? '#bbf7d0' : user.status === 'inactive' ? '#fecaca' : '#fde68a'}`,
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ 
                            color: isDarkMode ? '#fff' : '#64748b',
                            fontSize: '0.85rem'
                          }}>
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ar-EG') : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '-')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ 
                            color: isDarkMode ? '#fff' : '#64748b',
                            fontSize: '0.85rem'
                          }}>
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ar-EG') : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '-')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: "space-between", 
              alignItems: "center", 
              mt: 5,
              gap: { xs: 3, sm: 0 },
              pt: 4,
              borderTop: isDarkMode ? '2px solid var(--dark-800)' : '2px solid #f1f5f9'
            }}>
              <Button 
                onClick={() => setPage(p => p + 1)} 
                disabled={!data?.pagination.hasMore} 
                variant="contained"
                size="large"
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: isDarkMode ? 'var(--primary-700)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: isDarkMode ? '0 10px 15px -3px var(--primary-900)' : '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                  border: isDarkMode ? '1px solid var(--primary-900)' : '1px solid #2563eb',
                  color: isDarkMode ? '#fff' : undefined,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: isDarkMode ? 'var(--primary-800)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: isDarkMode ? '0 20px 25px -5px var(--primary-900)' : '0 20px 25px -5px rgba(59, 130, 246, 0.5)',
                    transform: 'translateY(-1px)',
                    color: isDarkMode ? '#fff' : undefined,
                  },
                  '&:disabled': {
                    background: isDarkMode ? 'var(--dark-700)' : '#e2e8f0',
                    color: isDarkMode ? '#fff' : '#94a3b8',
                    boxShadow: 'none',
                    border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid #e2e8f0',
                  }
                }}
              >
                التالي
              </Button>
              
              <Typography sx={{ 
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                color: isDarkMode ? '#fff' : '#475569',
                px: 3,
                py: 1,
                backgroundColor: isDarkMode ? 'var(--dark-800)' : '#f8fafc',
                borderRadius: 2,
                border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid #e2e8f0'
              }}>
                صفحة {data?.pagination.currentPage} من {data?.pagination.totalPages}
              </Typography>

              <Button 
                onClick={() => setPage(p => p - 1)} 
                disabled={page === 1} 
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderWidth: 2,
                  borderColor: isDarkMode ? '#fff' : '#3b82f6',
                  color: isDarkMode ? '#fff' : '#3b82f6',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: isDarkMode ? '#fff' : '#2563eb',
                    backgroundColor: isDarkMode ? 'var(--dark-800)' : '#eff6ff',
                    transform: 'translateY(-1px)',
                    boxShadow: isDarkMode ? '0 4px 6px -1px var(--primary-900)' : '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                    color: isDarkMode ? '#fff' : undefined,
                  },
                  '&:disabled': {
                    borderColor: isDarkMode ? 'var(--dark-700)' : '#e2e8f0',
                    color: isDarkMode ? '#fff' : '#94a3b8',
                    backgroundColor: 'transparent',
                  }
                }}
              >
                السابق
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default UsersPage;