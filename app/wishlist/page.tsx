"use client"
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
  Badge
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ShareOutlined from '@mui/icons-material/ShareOutlined';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '@/shared/provider/ToastProvider';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import PropertyCard, { toPropertyCardData } from '@/shared/ui/PropertyCard';
import CardGrid from '@/shared/ui/CardGrid';

export default function WishlistPage() {
  const { wishlist, loading, removeAllFromWishlist } = useWishlist();
  const { showToast } = useToast?.() || {};
  const [user, setUser] = useState<any>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleConfirmClear = async () => {
    setClearing(true);
    // The context shows the success or failure toast itself.
    const ok = await removeAllFromWishlist();
    setClearing(false);
    if (ok) setConfirmClearOpen(false);
  };

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
                  onClick={() => setConfirmClearOpen(true)}
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
            <CardGrid>
              {wishlist.map((item: any) => {
                const property = toPropertyCardData(item);
                return (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    actions={
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<ShareOutlined fontSize="small" />}
                        onClick={() => handleShare(item)}
                        aria-label={`نسخ رابط «${property.title}»`}
                      >
                        نسخ الرابط
                      </Button>
                    }
                  />
                );
              })}
            </CardGrid>
          </>
        )}
      </Container>
      <ConfirmDialog
        open={confirmClearOpen}
        title="إزالة كل العقارات من المفضلة"
        description={`سيتم إزالة ${wishlist.length} عقار من قائمة المفضلة دفعة واحدة، ولا يمكن التراجع عن ذلك.`}
        confirmLabel="إزالة الكل"
        loadingLabel="جاري الإزالة..."
        loading={clearing}
        onConfirm={handleConfirmClear}
        onClose={() => setConfirmClearOpen(false)}
      />
    </Box>
  );
}