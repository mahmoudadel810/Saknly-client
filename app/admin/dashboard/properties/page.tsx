"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Container,
  Fade,
  Grow,
  Slide
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import {
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  Home as HomeIcon,
  Apartment as RentIcon,
  School as StudentIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  SquareFoot as AreaIcon,
  AttachMoney as PriceIcon,
  Schedule as DateIcon
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useDarkMode } from "@/app/context/DarkModeContext";

// Types
interface Property {
  _id: string;
  title: string;
  description?: string;
  location?: { address?: string };
  area?: number;
  price?: number;
  createdAt: string;
  category: 'sale' | 'rent' | 'student';
  owner?: {
    _id: string;
    userName?: string;
    name?: string;
    email?: string;
  };
}

interface PropertyTypeConfig {
  key: 'sale' | 'rent' | 'student';
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning';
  gradient: string;
}

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1';

const propertyTypes: PropertyTypeConfig[] = [
  { 
    key: 'sale', 
    label: "عقارات للبيع", 
    icon: <HomeIcon />, 
    color: 'primary',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  { 
    key: 'rent', 
    label: "عقارات للإيجار", 
    icon: <RentIcon />, 
    color: 'success',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
  },
  { 
    key: 'student', 
    label: "سكن طلابي", 
    icon: <StudentIcon />, 
    color: 'warning',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
];

// Components
const PropertyCard = ({ 
  property,
  onApprove,
  onDeny,
  loading
}: {
  property: Property;
  onApprove: () => void;
  onDeny: () => void;
  loading: boolean;
}) => {
  const { isDarkMode } = useDarkMode();
  const [expanded, setExpanded] = useState(false);

  return (
    <Fade in={true} timeout={600}>
      <Card sx={{ 
        borderRadius: 4, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        mb: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          boxShadow: isDarkMode ? '0 8px 30px var(--dark-900)' : '0 8px 30px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: propertyTypes.find(t => t.key === property.category)?.gradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        },
        background: isDarkMode ? 'var(--dark-800)' : '#fff',
        color: isDarkMode ? '#fff' : undefined,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar 
              sx={{ 
                background: propertyTypes.find(t => t.key === property.category)?.gradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                width: { xs: 52, md: 60 }, 
                height: { xs: 52, md: 60 },
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                ,border: isDarkMode ? '2px solid var(--dark-700)' : undefined
              }}
            >
              {propertyTypes.find(t => t.key === property.category)?.icon}
            </Avatar>
            
            <Box flex={1} minWidth={0}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: isDarkMode ? '#fff' : 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    mr: 1,
                    lineHeight: 1.3
                  }}
                >
                  {property.title}
                </Typography>
                <Tooltip title="معلومات إضافية" arrow>
                  <IconButton 
                    size="small" 
                    onClick={() => setExpanded(!expanded)}
                    sx={{ 
                      flexShrink: 0,
                      bgcolor: isDarkMode ? 'var(--dark-700)' : 'rgba(0,0,0,0.04)',
                      '&:hover': {
                        bgcolor: isDarkMode ? 'var(--dark-600)' : 'rgba(0,0,0,0.08)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <LocationIcon sx={{ fontSize: 16, color: isDarkMode ? '#fff' : 'text.secondary' }} />
                <Typography 
                  variant="body2" 
                  color={isDarkMode ? '#fff' : 'text.secondary'} 
                  sx={{ 
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}
                >
                  {property.location?.address || 'لا يوجد عنوان'}
                </Typography>
              </Stack>

              <Collapse in={expanded} timeout="auto">
                <Box sx={{ mt: 2 }}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: isDarkMode ? 'var(--dark-700)' : 'grey.50', 
                    borderRadius: 2,
                    border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {/* Owner Info */}
                    {property.owner && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#fff' : 'text.primary', fontWeight: 600 }}>
                          اسم الرافع: {property.owner.userName || property.owner.name || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#fff' : 'text.secondary' }}>
                          البريد الإلكتروني: {property.owner.email || '-'}
                        </Typography>
                      </Box>
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                        color: isDarkMode ? '#fff' : 'text.secondary',
                        mb: 2,
                        lineHeight: 1.5
                      }}
                    >
                      {property.description || 'لا يوجد وصف'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      <Box sx={{ flex: '1 1 180px', minWidth: 120, mb: { xs: 1, sm: 0 } }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AreaIcon sx={{ fontSize: 16, color: isDarkMode ? '#fff' : 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, color: isDarkMode ? '#fff' : undefined }}>
                            المساحة: <strong>{property.area || '--'} م²</strong>
                          </Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ flex: '1 1 180px', minWidth: 120 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PriceIcon sx={{ fontSize: 16, color: isDarkMode ? '#fff' : 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, color: isDarkMode ? '#fff' : undefined }}>
                            السعر: <strong>{property.price ? `${property.price.toLocaleString()} ج.م` : '--'}</strong>
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                    
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <DateIcon sx={{ fontSize: 16, color: isDarkMode ? '#fff' : 'text.secondary' }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                          color: isDarkMode ? '#fff' : 'text.secondary'
                        }}
                      >
                        تاريخ الإضافة: {format(new Date(property.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </Typography>
                    </Stack>
                  </Paper>
                </Box>
              </Collapse>

              <Box 
                sx={{ 
                  mt: 2.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  startIcon={<ApproveIcon />}
                  onClick={onApprove}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 3,
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    fontWeight: 600,
                    py: 1.2,
                    px: 5.5,
                    background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    gap: 0.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
                      boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease',
                    color: isDarkMode ? '#fff' : undefined,
                  }}
                >
                  موافقة
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="medium"
                  startIcon={<DenyIcon />}
                  onClick={onDeny}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 3,
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    fontWeight: 600,
                    py: 1.2,
                    px: 4.7,
                    borderWidth: 2,
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    gap: 1,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    },
                    transition: 'all 0.2s ease',
                    color: isDarkMode ? '#fff' : undefined,
                  }}
                >
                  رفض
                </Button>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
};

const PropertyTypeSection = ({
  typeConfig,
  properties,
  onApprove,
  onDeny,
  isLoading
}: {
  typeConfig: PropertyTypeConfig;
  properties: Property[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  isLoading: boolean;
}) => {
  const { isDarkMode } = useDarkMode();
  return (
    <Grow in={true} timeout={800}>
      <Card sx={{ 
        borderRadius: 4, 
        boxShadow: '0 6px 25px rgba(0,0,0,0.1)', 
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          boxShadow: isDarkMode ? '0 12px 40px var(--dark-900)' : '0 12px 40px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: typeConfig.gradient,
        },
        background: isDarkMode ? 'var(--dark-800)' : '#fff',
        color: isDarkMode ? '#fff' : undefined,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{ 
              background: typeConfig.gradient,
              color: 'white',
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              ,border: isDarkMode ? '2px solid var(--dark-700)' : undefined
            }}>
              {typeConfig.icon}
            </Avatar>
            <Box flex={1}>
              <Typography 
                variant="h5" 
                fontWeight={700}
                sx={{ 
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  color: isDarkMode ? '#fff' : 'text.primary',
                  mb: 0.5
                }}
              >
                {typeConfig.label}
              </Typography>
              <Chip 
                label={`${properties.length} عقار`} 
                sx={{ 
                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                  fontWeight: 600,
                  background: typeConfig.gradient,
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
            </Box>
          </Stack>
          <Divider sx={{ 
            mb: 3,
            background: `linear-gradient(90deg, ${typeConfig.gradient})`,
            height: 2,
            borderRadius: 1
          }} />
          {isLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <CircularProgress 
                size={32} 
                sx={{ 
                  color: typeConfig.color === 'primary' ? '#3b82f6' : typeConfig.color === 'success' ? '#22c55e' : '#f59e0b',
                  mb: 2
                }} 
              />
              <Typography variant="body2" color={isDarkMode ? '#fff' : 'text.secondary'}>
                جاري التحميل...
              </Typography>
            </Box>
          ) : properties.length === 0 ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: isDarkMode ? 'var(--dark-700)' : 'grey.50',
              borderRadius: 3,
              border: isDarkMode ? '1px solid var(--dark-700)' : '1px solid rgba(0,0,0,0.05)'
            }}>
              <Typography 
                color={isDarkMode ? '#fff' : 'text.secondary'} 
                sx={{ 
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontWeight: 500
                }}
              >
                �� لا توجد عقارات معلقة
              </Typography>
              <Typography 
                variant="body2" 
                color={isDarkMode ? '#fff' : 'text.secondary'}
                sx={{ mt: 1 }}
              >
                جميع العقارات تم مراجعتها
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {properties.map((property, index) => (
                <Slide 
                  key={property._id} 
                  direction="right" 
                  in={true} 
                  timeout={300 + index * 100}
                >
                  <div>
                    <PropertyCard
                      property={property}
                      onApprove={() => onApprove(property._id)}
                      onDeny={() => onDeny(property._id)}
                      loading={isLoading}
                    />
                  </div>
                </Slide>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

const PropertiesAdminPage = () => {
  const { isDarkMode } = useDarkMode();
  const queryClient = useQueryClient();
  const [denyDialog, setDenyDialog] = useState<{ open: boolean; id: string | null }>({ 
    open: false, 
    id: null 
  });
  const [denyReason, setDenyReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' 
  }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Fetch pending properties
  const { data: pendingProperties, isLoading } = useQuery({
    queryKey: ['pending-properties'],
    queryFn: async () => {
      const token = localStorage.getItem('token') || '';
      const responses = await Promise.all(
        propertyTypes.map(type => 
          fetch(`${API_URL}/properties/pending?category=${type.key}`, {
            headers: { Authorization: `${process.env.TOKEN_PREFIX}${token}` },
          }).then(res => res.json())
        )
      );
      
      return propertyTypes.reduce((acc, type, index) => {
        acc[type.key] = responses[index].data || [];
        return acc;
      }, {} as Record<'sale' | 'rent' | 'student', Property[]>);
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/properties/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Saknly__${token}` 
        },
        body: JSON.stringify({ 
          status: 'available', 
          isActive: true, 
          isApproved: true 
        })
      });
      if (!res.ok) throw new Error('Failed to approve property');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-properties'] });
      setSnackbar({ 
        open: true, 
        message: 'تمت الموافقة على العقار بنجاح', 
        severity: 'success' 
      });
    },
    onError: () => {
      setSnackbar({ 
        open: true, 
        message: 'فشل الموافقة على العقار', 
        severity: 'error' 
      });
    }
  });

  // Deny mutation
  const denyMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/properties/${id}/deny?reason=${encodeURIComponent(reason)}`, {
        method: 'DELETE',
        headers: { Authorization: `Saknly__${token}` },
      });
      if (!res.ok) throw new Error('Failed to deny property');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-properties'] });
      setSnackbar({ 
        open: true, 
        message: 'تم رفض العقار بنجاح', 
        severity: 'success' 
      });
      setDenyDialog({ open: false, id: null });
      setDenyReason('');
    },
    onError: () => {
      setSnackbar({ 
        open: true, 
        message: 'فشل رفض العقار', 
        severity: 'error' 
      });
    }
  });

  const handleOpenDenyDialog = (id: string) => {
    setDenyDialog({ open: true, id });
  };

  const handleCloseDenyDialog = () => {
    if (!denyMutation.isPending) {
      setDenyDialog({ open: false, id: null });
      setDenyReason('');
    }
  };

  const handleDeny = () => {
    if (denyDialog.id && denyReason.trim()) {
      denyMutation.mutate({ id: denyDialog.id, reason: denyReason });
    }
  };

  const totalPendingCount = pendingProperties ? 
    Object.values(pendingProperties).reduce((sum, properties) => sum + properties.length, 0) : 0;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: isDarkMode ? 'var(--dark-900)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      color: isDarkMode ? '#fff' : undefined,
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in={true} timeout={1000}>
          <Paper sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: { xs: 3, md: 4 },
            textAlign: 'center',
            borderRadius: 4,
            background: isDarkMode ? 'var(--dark-800)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: isDarkMode ? '#fff' : 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                mb: 1,
                textShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                color: isDarkMode ? '#fff' : undefined,
              }}
            >
              إدارة العقارات المعلقة
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.1rem' },
                opacity: 0.9,
                fontWeight: 400,
                color: isDarkMode ? '#fff' : undefined,
              }}
            >
              مراجعة واعتماد العقارات الجديدة
            </Typography>
            {totalPendingCount > 0 && (
              <Chip 
                label={`${totalPendingCount} عقار في الانتظار`}
                sx={{ 
                  mt: 2,
                  bgcolor: isDarkMode ? 'var(--dark-700)' : 'rgba(255,255,255,0.2)',
                  color: isDarkMode ? '#fff' : 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
            )}
          </Paper>
        </Fade>

        {/* Property Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: { xs: 2, md: 3 } }}>
          {propertyTypes.map((type) => (
            <Box key={type.key} sx={{ flex: '1 1 0', minWidth: 0, maxWidth: '100%' }}>
              <PropertyTypeSection
                typeConfig={type}
                properties={pendingProperties?.[type.key] || []}
                onApprove={approveMutation.mutate}
                onDeny={handleOpenDenyDialog}
                isLoading={isLoading}
              />
            </Box>
          ))}
        </Box>

        {/* Deny Dialog */}
        <Dialog
          open={denyDialog.open}
          onClose={handleCloseDenyDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              background: isDarkMode ? 'var(--dark-800)' : undefined,
              color: isDarkMode ? '#fff' : undefined,
            }
          }}
        >
          <DialogTitle sx={{ 
            background: isDarkMode ? 'var(--error-900)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: isDarkMode ? '#fff' : 'white',
            borderRadius: '16px 16px 0 0'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                سبب رفض العقار
              </Typography>
              <IconButton 
                onClick={handleCloseDenyDialog}
                disabled={denyMutation.isPending}
                sx={{ color: isDarkMode ? '#fff' : 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              label="السبب (مطلوب)"
              fullWidth
              variant="outlined"
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              multiline
              rows={4}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? 'var(--error-700)' : '#ef4444'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? 'var(--error-700)' : '#ef4444'
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={handleCloseDenyDialog}
              disabled={denyMutation.isPending}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1
                ,color: isDarkMode ? '#fff' : undefined
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleDeny}
              variant="contained"
              disabled={denyMutation.isPending || !denyReason.trim()}
              startIcon={<DenyIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                background: isDarkMode ? 'var(--error-900)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: isDarkMode ? '#fff' : undefined,
                '&:hover': {
                  background: isDarkMode ? 'var(--error-800)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: isDarkMode ? '#fff' : undefined,
                }
              }}
            >
              {denyMutation.isPending ? 'جاري الرفض...' : 'تأكيد الرفض'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              fontWeight: 500
              ,color: isDarkMode ? '#fff' : undefined
            }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PropertiesAdminPage;