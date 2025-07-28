"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  CircularProgress,
  TextField,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Paper,
  TableContainer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Delete,
  Business,
  Star,
  StarBorder,
  Edit,
  Close,
  Check
} from '@mui/icons-material';
import { useDebounce } from 'use-debounce';
import { Agency } from '../../../../shared/types/index';
import { useDarkMode } from "@/app/context/DarkModeContext";

const PAGE_SIZE = 10;

// Color palette
const colors = {
  primary: '#2563eb', // Blue
  secondary: '#7c3aed', // Purple
  success: '#059669', // Green
  warning: '#d97706', // Orange
  error: '#dc2626', // Red
  background: '#f8fafc', // Light background
  surface: '#ffffff', // Light surface
  surfaceVariant: '#f1f5f9', // Light surface variant
  onSurface: '#1e293b', // Dark text on light surface
  onSurfaceVariant: '#64748b', // Muted text
  accent: '#8b5cf6',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
};

const AgencyTable = ({
  agencies,
  columns,
  onRowClick,
  onDelete,
  onToggleFeatured,
  isLoading
}: {
  agencies: Agency[];
  columns: any[];
  onRowClick: (agency: Agency) => void;
  onDelete: (agency: Agency) => void;
  onToggleFeatured: (agency: Agency) => Promise<void>;
  isLoading: boolean;
}) => {
  const theme = useTheme();
  const { isDarkMode } = useDarkMode();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: { xs: 2, md: 3 }, 
        overflow: 'hidden', 
        mb: 3,
        border: isDarkMode ? '1px solid var(--dark-700)' : `1px solid ${colors.surfaceVariant}`,
        backgroundColor: isDarkMode ? 'var(--dark-800)' : colors.surface,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}
    >
      <TableContainer sx={{ minWidth: { xs: 600, sm: 'auto' }, background: isDarkMode ? 'var(--dark-800)' : undefined }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              background: isDarkMode ? 'var(--dark-700)' : colors.gradient,
              '& .MuiTableCell-head': {
                color: isDarkMode ? '#fff' : colors.surface,
                fontWeight: 600
              }
            }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.key} 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                    color: isDarkMode ? '#fff' : colors.surface,
                    display: ['logo', 'description', 'isFeatured', 'createdAt'].includes(column.key) ? { xs: 'none', sm: 'table-cell' } : undefined
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 1.5 },
                  color: isDarkMode ? '#fff' : colors.surface
                }}
              >
                إجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} sx={{ color: isDarkMode ? '#fff' : colors.primary }} />
                </TableCell>
              </TableRow>
            ) : agencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ 
                  py: 4,
                  color: isDarkMode ? '#fff' : colors.onSurfaceVariant
                }}>
                  لا توجد وكالات
                </TableCell>
              </TableRow>
            ) : (
              agencies.map((agency) => (
                <TableRow
                  key={agency._id}
                  hover
                  sx={{ 
                    '&:hover': { 
                      cursor: 'pointer',
                      backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.surfaceVariant + '40'
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: isDarkMode ? 'var(--dark-800)' : colors.background
                    }
                  }}
                  onClick={() => onRowClick(agency)}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key}
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        color: isDarkMode ? '#fff' : colors.onSurface,
                        display: ['logo', 'description', 'isFeatured', 'createdAt'].includes(column.key) ? { xs: 'none', sm: 'table-cell' } : undefined
                      }}
                    >
                      {column.render ? column.render(agency) : agency[column.key as keyof Agency]}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      px: { xs: 1, sm: 2 },
                      py: { xs: 1, sm: 1.5 }
                    }}
                  >
                    <Box display="flex" gap={0.5}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFeatured(agency);
                        }}
                        sx={{
                          color: isDarkMode ? '#fff' : (agency.isFeatured ? colors.warning : colors.onSurfaceVariant),
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'var(--dark-700)' : (agency.isFeatured ? colors.warning + '20' : colors.onSurfaceVariant + '20')
                          }
                        }}
                        size="small"
                      >
                        {agency.isFeatured ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(agency);
                        }}
                        sx={{
                          color: isDarkMode ? '#fff' : colors.error,
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.error + '20'
                          }
                        }}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const AgenciesPage = () => {
  const { isDarkMode } = useDarkMode();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchAgencies = async (searchValue = '', pageValue = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchValue,
        page: String(pageValue),
        limit: String(PAGE_SIZE),
      });
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/agencies/featured?${params.toString()}`
      );
      
      if (!res.ok) throw new Error('فشل في جلب الوكالات');
      
      const data = await res.json();
      setAgencies(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies(debouncedSearch, page);
  }, [debouncedSearch, page]);

  const handleToggleFeatured = async (agency: Agency) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/agencies/${agency._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `${process.env.TOKEN_PREFIX}${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isFeatured: !agency.isFeatured }),
        }
      );

      if (!res.ok) throw new Error('فشل في تحديث حالة الوكالة');

      setAgencies((prev) =>
        prev.map((a) =>
          a._id === agency._id
            ? { ...a, isFeatured: !a.isFeatured }
            : a
        )
      );
    } catch (err) {
      console.error('Error toggling featured status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgency = async () => {
    if (!selectedAgency) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/agencies/${selectedAgency._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Saknly__${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('فشل حذف الوكالة');

      setAgencies((prev) =>
        prev.filter((a) => a._id !== selectedAgency._id)
      );
      setSelectedAgency(null);
      setDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting agency:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'logo',
      label: 'الشعار',
      render: (agency: Agency) => (
        <Avatar 
          src={agency.logo} 
          alt={agency.name}
          sx={{ 
            width: { xs: 32, sm: 40 }, 
            height: { xs: 32, sm: 40 },
            background: colors.gradient,
            color: colors.surface,
            fontWeight: 600
          }}
        >
          {agency.name?.charAt(0)}
        </Avatar>
      ),
    },
    {
      key: 'name',
      label: 'اسم الوكالة',
      render: (agency: Agency) => (
        <Typography 
          fontWeight={700}
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            color: colors.onSurface
          }}
        >
          {agency.name}
        </Typography>
      ),
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (agency: Agency) => (
        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
            maxWidth: { xs: 120, sm: 200 },
            color: colors.onSurfaceVariant
          }}
        >
          {agency.description || '-'}
        </Typography>
      ),
    },
    {
      key: 'isFeatured',
      label: 'الحالة',
      render: (agency: Agency) => (
        <Chip
          label={agency.isFeatured ? 'مميزة' : 'عادية'}
          sx={{
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            backgroundColor: agency.isFeatured ? colors.warning : colors.surfaceVariant,
            color: agency.isFeatured ? colors.surface : colors.onSurfaceVariant,
            fontWeight: 600
          }}
          size="small"
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (agency: Agency) => (
        <Typography sx={{ 
          fontSize: { xs: '0.7rem', sm: '0.875rem' },
          color: colors.onSurfaceVariant
        }}>
          {agency.createdAt
            ? new Date(agency.createdAt).toLocaleDateString()
            : '-'}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDarkMode ? 'var(--dark-900)' : colors.background,
      color: isDarkMode ? '#fff' : colors.onSurface,
      p: { xs: 1, sm: 2, md: 4 }
    }}>
      {/* Header */}
      <Box sx={{ 
        mb: { xs: 2, md: 4 }, 
        textAlign: 'center',
        p: { xs: 2, md: 4 },
        background: isDarkMode ? 'var(--dark-800)' : colors.gradient,
        borderRadius: { xs: 2, md: 3 },
        color: isDarkMode ? '#fff' : colors.surface
      }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' }, 
            mb: { xs: 0.5, md: 2 },
            color: isDarkMode ? '#fff' : colors.surface
          }}
        >
          إدارة الوكالات
        </Typography>
        <Typography
          variant="body1"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            color: isDarkMode ? '#fff' : colors.surface,
            opacity: 0.9
          }}
        >
          عرض وإدارة جميع الوكالات المسجلة
        </Typography>
      </Box>

      <Box sx={{ width: '100%', overflowX: { xs: 'auto', md: 'visible' } }}>
        {/* Search and Filters */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 2, md: 3 },
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          
        </Box>

        {/* Error Handling */}
        {error && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            backgroundColor: isDarkMode ? 'var(--error-900)' : colors.error + '20',
            borderRadius: 2,
            border: isDarkMode ? '1px solid var(--error-700)' : `1px solid ${colors.error}40`
          }}>
            <Typography 
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: isDarkMode ? '#fff' : colors.error,
                fontWeight: 600
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Mobile Cards */}
        {isMobile ? (
          <Box>
            {agencies.map((agency) => (
              <Paper 
                key={agency._id} 
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: isDarkMode ? 'var(--dark-800)' : colors.surface,
                  border: isDarkMode ? '1px solid var(--dark-700)' : `1px solid ${colors.surfaceVariant}`,
                  borderRadius: 2,
                  boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)'
                }}
              >
                <Typography 
                  fontWeight={700}
                  sx={{ color: isDarkMode ? '#fff' : colors.onSurface }}
                >
                  {agency.name}
                </Typography>
                <Box>
                  <IconButton 
                    onClick={() => handleToggleFeatured(agency)} 
                    sx={{ 
                      color: isDarkMode ? '#fff' : (agency.isFeatured ? colors.warning : colors.onSurfaceVariant),
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'var(--dark-700)' : (agency.isFeatured ? colors.warning + '20' : colors.onSurfaceVariant + '20')
                      }
                    }}
                  >
                    {agency.isFeatured ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                  </IconButton>
                  <IconButton 
                    onClick={() => { setSelectedAgency(agency); setDeleteDialog(true); }} 
                    sx={{ 
                      color: isDarkMode ? '#fff' : colors.error,
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.error + '20'
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <AgencyTable
            agencies={agencies}
            columns={columns}
            onRowClick={setSelectedAgency}
            onDelete={(agency) => {
              setSelectedAgency(agency);
              setDeleteDialog(true);
            }}
            onToggleFeatured={handleToggleFeatured}
            isLoading={loading}
          />
        )}

        {/* Pagination */}
        {agencies.length > 0 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              disabled={loading}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: isDarkMode ? '#fff' : colors.onSurface,
                  '&.Mui-selected': {
                    backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.primary,
                    color: isDarkMode ? '#fff' : colors.surface,
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'var(--dark-600)' : colors.primary + 'dd',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.primary + '20',
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Agency Details Dialog */}
      <Dialog
        open={!!selectedAgency}
        onClose={() => setSelectedAgency(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: '90vh', sm: 'auto' },
            backgroundColor: isDarkMode ? 'var(--dark-800)' : colors.surface,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 700,
              color: isDarkMode ? '#fff' : colors.onSurface
            }}>
              تفاصيل الوكالة
            </Typography>
            <IconButton 
              onClick={() => setSelectedAgency(null)} 
              size="small"
              sx={{
                color: isDarkMode ? '#fff' : colors.onSurfaceVariant,
                '&:hover': {
                  backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.onSurfaceVariant + '20'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {selectedAgency && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                pt: 2,
              }}
            >
              <Avatar
                src={selectedAgency.logo}
                sx={{ 
                  width: { xs: 60, sm: 80 }, 
                  height: { xs: 60, sm: 80 }, 
                  fontSize: { xs: 24, sm: 32 },
                  background: isDarkMode ? 'var(--dark-700)' : colors.gradient,
                  color: isDarkMode ? '#fff' : colors.surface,
                  fontWeight: 700
                }}
              >
                {selectedAgency.name?.charAt(0)}
              </Avatar>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  color: isDarkMode ? '#fff' : colors.onSurface
                }}
              >
                {selectedAgency.name}
              </Typography>
              <Chip
                label={selectedAgency.isFeatured ? 'مميزة' : 'عادية'}
                sx={{
                  mb: 1,
                  backgroundColor: selectedAgency.isFeatured ? (isDarkMode ? 'var(--warning-700)' : colors.warning) : (isDarkMode ? 'var(--dark-700)' : colors.surfaceVariant),
                  color: isDarkMode ? '#fff' : (selectedAgency.isFeatured ? colors.surface : colors.onSurfaceVariant),
                  fontWeight: 600
                }}
                size="small"
              />
              <Typography
                variant="body1"
                textAlign="center"
                sx={{ 
                  maxWidth: 400,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: isDarkMode ? '#fff' : colors.onSurfaceVariant
                }}
              >
                {selectedAgency.description || 'لا يوجد وصف'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 2, sm: 4 },
                  mt: 2,
                  width: '100%',
                  justifyContent: 'space-around',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      color: isDarkMode ? '#fff' : colors.onSurfaceVariant
                    }}
                  >
                    تاريخ الإنشاء
                  </Typography>
                  <Typography sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    color: isDarkMode ? '#fff' : colors.onSurface
                  }}>
                    {selectedAgency.createdAt
                      ? new Date(selectedAgency.createdAt).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      color: isDarkMode ? '#fff' : colors.onSurfaceVariant
                    }}
                  >
                    آخر تحديث
                  </Typography>
                  <Typography sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    color: isDarkMode ? '#fff' : colors.onSurface
                  }}>
                    {selectedAgency.updatedAt
                      ? new Date(selectedAgency.updatedAt).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Button
            onClick={() => setSelectedAgency(null)}
            variant="outlined"
            size="small"
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              borderColor: isDarkMode ? '#fff' : colors.primary,
              color: isDarkMode ? '#fff' : colors.primary,
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.primary + '20',
                borderColor: isDarkMode ? '#fff' : colors.primary,
              }
            }}
          >
            إغلاق
          </Button>
          <Button
            onClick={() => {
              setDeleteDialog(true);
            }}
            variant="contained"
            startIcon={<Delete />}
            size="small"
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              backgroundColor: isDarkMode ? 'var(--error-900)' : colors.error,
              color: isDarkMode ? '#fff' : undefined,
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--error-700)' : colors.error + 'dd',
              }
            }}
          >
            حذف الوكالة
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => !actionLoading && setDeleteDialog(false)}
        PaperProps={{
          sx: { 
            m: { xs: 1, sm: 2 },
            backgroundColor: isDarkMode ? 'var(--dark-800)' : colors.surface,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1rem', sm: '1.25rem' },
          fontWeight: 700,
          color: isDarkMode ? '#fff' : colors.onSurface
        }}>
          تأكيد الحذف
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            color: isDarkMode ? '#fff' : colors.onSurfaceVariant
          }}>
            هل أنت متأكد أنك تريد حذف الوكالة "{selectedAgency?.name}"؟ لا يمكن
            التراجع عن هذا الإجراء.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            disabled={actionLoading}
            size="small"
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              color: isDarkMode ? '#fff' : colors.onSurfaceVariant,
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--dark-700)' : colors.onSurfaceVariant + '20',
              }
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDeleteAgency}
            variant="contained"
            startIcon={<Check />}
            disabled={actionLoading}
            size="small"
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              backgroundColor: isDarkMode ? 'var(--error-900)' : colors.error,
              color: isDarkMode ? '#fff' : undefined,
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--error-700)' : colors.error + 'dd',
              }
            }}
          >
            {actionLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgenciesPage;