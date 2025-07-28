"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Container,
  Paper,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '@/shared/provider/ToastProvider';

type PropertyCardProps = {
  property: any;
  onRemove: (id: string) => void;
  onShare: (property: any) => void;
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onRemove, onShare }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const formatPrice = (price: number, category: string) => {
    if (category === 'rent') {
      return `${price.toLocaleString()} ريال/شهر`;
    }
    return `${price.toLocaleString()} ريال`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.1)', dark: '0 4px 24px rgba(24,24,27,0.25)' },
        backgroundColor: { xs: '#fff', dark: '#23232a' },
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: { xs: '0 8px 24px rgba(0,0,0,0.15)', dark: '0 8px 32px rgba(24,24,27,0.35)' },
        },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Image Container */}
      <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        {!imageLoaded && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: { xs: 'grey.200', dark: '#333' }
          }}>
            <CircularProgress size={30} sx={{ color: { xs: '#1976d2', dark: '#a5b4fc' } }} />
          </Box>
        )}
        <CardMedia
          component="img"
          height="200"
          image={property.images[0]?.url}
          alt={property.title}
          onLoad={() => setImageLoaded(true)}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />

        {/* Category Badge */}
        <Chip
          label={property.category === 'rent' ? 'إيجار' : 'بيع'}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: property.category === 'rent' ? { xs: '#4caf50', dark: '#166534' } : { xs: '#2196f3', dark: '#1e40af' },
            color: { xs: 'white', dark: '#e0e7ff' },
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }}
        />

        {/* Remove Button */}
        <Tooltip title="إزالة من المفضلة">
          <IconButton
            onClick={() => onRemove(property.id)}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: { xs: 'rgba(255,255,255,0.9)', dark: 'rgba(127,29,29,0.8)' },
              color: { xs: '#f44336', dark: '#fecaca' },
              '&:hover': {
                backgroundColor: { xs: 'rgba(244,67,54,0.1)', dark: 'rgba(185,28,28,0.4)' },
                color: { xs: '#f44336', dark: '#fecaca' }
              }
            }}
          >
            <RemoveCircleOutlineIcon sx={{ color: { xs: '#f44336', dark: '#fecaca' } }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Price */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: { xs: '#1976d2', dark: '#a5b4fc' },
            mb: 1,
            fontSize: '1.1rem'
          }}
        >
          {formatPrice(property.price, property.category)}
        </Typography>

        {/* Title */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: '600',
            mb: 1,
            color: { xs: '#333', dark: '#fff' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {property.title}
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon sx={{ color: { xs: '#666', dark: '#a5b4fc' }, fontSize: '1rem', mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: { xs: '#666', dark: '#e0e7ff' }, fontSize: '0.85rem' }}>
            {property.location.district}, {property.location.city}
          </Typography>
        </Box>

        {/* Property Details */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BedIcon sx={{ color: { xs: '#666', dark: '#e0e7ff' }, fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="body2" sx={{ color: { xs: '#666', dark: '#e0e7ff' }, fontSize: '0.85rem', mr: 1 }}>
              {property.bedrooms}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BathtubIcon sx={{ color: { xs: '#666', dark: '#e0e7ff' }, fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="body2" sx={{ color: { xs: '#666', dark: '#e0e7ff' }, fontSize: '0.85rem', mr: 1 }}>
              {property.bathrooms}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SquareFootIcon sx={{ color: { xs: '#666', dark: '#e0e7ff' }, fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="body2" sx={{ color: { xs: '#666', dark: '#e0e7ff' }, fontSize: '0.85rem' }}>
              {property.area} م²
            </Typography>
          </Box>
        </Box>

        {/* Property Type */}
        <Chip
          label={property.type}
          size="small"
          sx={{
            backgroundColor: { xs: '#f5f5f5', dark: '#18181b' },
            color: { xs: '#666', dark: '#a5b4fc' },
            fontSize: '0.75rem',
            mb: 2
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<VisibilityIcon />}
            sx={{
              backgroundColor: { xs: '#1976d2', dark: '#3730a3' },
              color: '#fff',
              textTransform: 'none',
              borderRadius: 1,
              fontSize: '0.85rem',
              '&:hover': {
                backgroundColor: { xs: '#1565c0', dark: '#312e81' }
              }
            }}
            onClick={() => router.push(`/properties/${property.id}`)}
          >
            <Box mx={1}>عرض التفاصيل</Box>
          </Button>
          <Tooltip title="مشاركة">
            <IconButton
              sx={{
                border: { xs: '1px solid #e0e0e0', dark: '1px solid #818cf8' },
                borderRadius: 1,
                color: { xs: '#666', dark: '#a5b4fc' },
                '&:hover': {
                  backgroundColor: { xs: '#f5f5f5', dark: '#23232a' }
                }
              }}
              onClick={() => onShare(property)}
            >
              <ShareIcon fontSize="small" sx={{ color: { xs: '#666', dark: '#a5b4fc' } }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist, removeAllFromWishlist } = useWishlist();
  const { showToast } = useToast?.() || {};
  const [user, setUser] = useState<any>(null);

  // مشاركة العقار
  const handleShare = async (property: any) => {
    const url = `${window.location.origin}/properties/${property.id}`;
    try {
      await navigator.clipboard.writeText(url);
      if (showToast) showToast('تم نسخ رابط العقار!', 'success');
    } catch {
      if (showToast) showToast('حدث خطأ أثناء نسخ الرابط', 'error');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: { xs: '#1976d2', dark: '#a5b4fc' }, mb: 3 }} />
        <Typography variant="h6" sx={{ color: { xs: '#666', dark: '#e0e7ff' } }}>
          جاري تحميل قائمة الأمنيات...
        </Typography>
      </Container>
    );
  }

  return (
    <Box className="bg-gray-50 dark:bg-dark-900" sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: { xs: '#1976d2', dark: '#a5b4fc' },
              mb: 2,
              textAlign: 'center'
            }}
          >
            <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle', color: { xs: '#1976d2', dark: '#a5b4fc' } }} />
            قائمة الأمنيات
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: { xs: '#666', dark: '#e0e7ff' },
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            هنا ستجد جميع العقارات التي أضفتها إلى قائمة المفضلة لديك
          </Typography>
        </Box>

        {wishlist.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: { xs: '#fff', dark: '#23232a' }
            }}
          >
            <FavoriteIcon sx={{ fontSize: 80, color: { xs: '#1976d2', dark: '#a5b4fc' }, mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, color: { xs: '#333', dark: '#fff' }, fontWeight: 'bold' }}>
              قائمة الأمنيات فارغة
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: { xs: '#666', dark: '#e0e7ff' }, maxWidth: 400, mx: 'auto' }}>
              لم تقم بإضافة أي عقارات إلى قائمة الأمنيات بعد. ابدأ بتصفح العقارات وأضف ما يعجبك إلى المفضلة!
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: { xs: '#1976d2', dark: '#3730a3' },
                color: '#fff',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { backgroundColor: { xs: '#1565c0', dark: '#312e81' } }
              }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/properties';
                }
              }}
            >
              تصفح العقارات
            </Button>
          </Paper>
        ) : (
          <>
            {/* Controls Bar */}
            <Paper
              elevation={1}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                backgroundColor: { xs: '#fff', dark: '#23232a' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge badgeContent={wishlist.length} color="primary">
                    <FavoriteIcon sx={{ color: { xs: '#1976d2', dark: '#a5b4fc' } }} />
                  </Badge>
                  <Typography variant="h6" sx={{ color: { xs: '#333', dark: '#fff' }, fontWeight: 'bold' }}>
                    {wishlist.length} عقار في قائمة الأمنيات
                  </Typography>
                </Box>
                <Button
                  onClick={removeAllFromWishlist}
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    color: { xs: '#f44336', dark: '#fecaca' },
                    borderColor: { xs: '#f44336', dark: '#fecaca' },
                    backgroundColor: { xs: '#ffebee', dark: '#7f1d1d' },
                    '&:hover': { backgroundColor: { xs: '#ffcdd2', dark: '#991b1b' }, borderColor: { xs: '#f44336', dark: '#fecaca' } }
                  }}
                >
                  إزالة الكل
                </Button>
              </Box>
            </Paper>

            {/* Properties Grid */}
            <Box display="flex" flexWrap="wrap" gap={3}>
              {wishlist.map((property: any) => (
                <Box key={property.id} flex="1 1 250px" minWidth={250} maxWidth={350} p={1}>
                  <PropertyCard
                    property={property}
                    onRemove={removeFromWishlist}
                    onShare={handleShare}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}