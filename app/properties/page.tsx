"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react'; 
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Pagination,
  Fab,
  Zoom,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import FilterSidebar from '@/shared/components/FilterSidebar';
import PropertyMap from '@/shared/components/PropertyMap';
import { Property } from '@/shared/types';
import Head from 'next/head';
import {
  Map as MapIcon,
  ViewList as ViewListIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useWishlist } from '../context/WishlistContext';
import Snackbar from '@mui/material/Snackbar';

import { TransitionGroup, CSSTransition } from 'react-transition-group';


// Enhanced Property Card Component
const EnhancedPropertyCard: React.FC<{
  images: string[];
  price: string;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: string;
  description: string;
  location: { address: string; city: string; };
  initialPaymentAmount: string;
  statusTag: string;
  category: string;
  contactInfo?: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  propertyId: string;
  title: string;
}> = ({
  images,
  price,
  propertyType,
  beds,
  baths,
  sqft,
  description,
  location,
  initialPaymentAmount,
  statusTag,
  category,
  contactInfo,
  propertyId,
  title,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const router = useRouter();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [snackbarOpen, setSnackbarOpen] = useState(false);


  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return numPrice.toLocaleString();
  };

    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'available': return 'success';
        case 'sold': return 'error';
        case 'pending': return 'warning';
        default: return 'default';
      }
    };

    const getCategoryColor = (category: string) => {
      return category === 'rent' ? 'info' : 'primary';
    };

    const handleShare = () => {
      const url = window.location.origin + `/properties/${propertyId}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          setSnackbarOpen(true);
        }).catch(() => {
          fallbackCopyTextToClipboard(url);
        });
      } else {
        fallbackCopyTextToClipboard(url);
      }
    };

    function fallbackCopyTextToClipboard(text: string) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setSnackbarOpen(true);
      } catch (err) {}
      document.body.removeChild(textArea);
    }

  return (
    <Card
      sx={{
        maxWidth: isMobile ? '100%' : 380,
        margin: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
        position: 'relative',
        backgroundColor: '#fff',
        boxSizing: 'content-box',
        height: 640,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image Section */}
      <Box sx={{ position: 'relative', height: 220, minHeight: 220, maxHeight: 220, overflow: 'hidden', borderRadius: 2 }}>
        <CardMedia
          component="img"
          image={images[currentImageIndex] || '/placeholder-property.jpg'}
          alt={propertyType}
          sx={{
            height: 220,
            width: '100%',
            objectFit: 'cover',
            boxSizing: 'content-box',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />

        {/* Status and Category Tags */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={statusTag === 'available' ? 'متاح' : statusTag || 'متاح'}
            color={getStatusColor(statusTag)}
            size="small"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.75rem',
                  backgroundColor:
      statusTag?.toLowerCase() === 'available' ? '#3498db' :
      statusTag?.toLowerCase() === 'sold' ? '#e74c3c' :
      statusTag?.toLowerCase() === 'pending' ? '#f39c12' :
      '#bdc3c7',
    color: '#fff',
              backdropFilter: 'blur(10px)',
            }}
          />
          <Chip
            label={category === 'rent' ? 'للإيجار' : 'للبيع'}
            color={getCategoryColor(category)}
            size="small"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.75rem',
              backgroundColor: category === 'rent' ? '#27ae60' : '#e67e22',
              backdropFilter: 'blur(10px)',
            }}
          />
        </Box>

          {/* Action Buttons */}
          <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton
              sx={{
                backgroundColor: isInWishlist(propertyId) ? '#e60e0e' : '#DDD',
                color: '#fff',
                '&:hover': { backgroundColor: '#e60e0e' },
              }}
              onClick={() => {
                if (isInWishlist(propertyId)) {
                  removeFromWishlist(propertyId);
                } else {
                  addToWishlist({
                    id: propertyId,
                    title: description,
                    price,
                    images,
                    bedrooms: beds,
                    bathrooms: baths,
                    area: sqft,
                    type: propertyType,
                    category,
                    location,
                  });
                }
              }}
            >
              <FavoriteIcon sx={{ color: '#fff', fontSize: 20 }} />
            </IconButton>
            <IconButton
              sx={{
                backgroundColor: '#429aff',
                color: '#fff',
                '&:hover': { backgroundColor: '#2176c1' },
              }}
              onClick={handleShare}
            >
              <ShareIcon sx={{ color: '#fff', fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
              {images.slice(0, 5).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </Box>
          )}
        </Box>

      {/* Content Section */}
      <CardContent sx={{ p: 3, pb: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Price Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#1e293b',
              fontSize: '1.5rem',
              mb: 1,
              textAlign: 'right',
              direction: 'rtl',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#2c3e50',
              fontSize: '1rem',
              mb: 0.5,
            }}
          >
            {formatPrice(price)} جنيه
            {category === 'rent' && <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}> / شهر</span>}
          </Typography>
          {initialPaymentAmount && (
            <Typography variant="caption" sx={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
              {category === 'rent' ? 'التأمين: ' : 'المقدم: '}{formatPrice(initialPaymentAmount)} جنيه
            </Typography>
          )}
        </Box>

          {/* Property Type */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#34495e',
              mb: 1.5,
              fontSize: '1.1rem',
            }}
          >
            {propertyType}
          </Typography>

          {/* Property Details */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {beds > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BedIcon sx={{ color: '#7f8c8d', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                  {beds} غرف
                </Typography>
              </Box>
            )}
            {baths > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BathtubIcon sx={{ color: '#7f8c8d', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                  {baths} حمام
                </Typography>
              </Box>
            )}
            {sqft && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SquareFootIcon sx={{ color: '#7f8c8d', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                  {sqft} م²
                </Typography>
              </Box>
            )}
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <LocationIcon sx={{ color: '#e74c3c', fontSize: 18 }} />
            <Typography
              variant="body2"
              sx={{
                color: '#7f8c8d',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {location.address}, {location.city}
            </Typography>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: '#7f8c8d',
              mb: 2,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </Typography>

          {/* Contact Section */}
          {contactInfo && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 2,
              borderTop: '1px solid #ecf0f1',
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {contactInfo.phone && (
                  <Tooltip title="اتصال">
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        '&:hover': { backgroundColor: '#2980b9' },
                      }}
                      onClick={() => {
                        let phone = contactInfo.phone;
                        if (!phone) return;
                        if (phone.startsWith('0')) {
                          phone = '+20' + phone.slice(1);
                        }
                        window.open(`tel:${phone}`);
                      }}
                    >
                      <PhoneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {contactInfo.whatsapp && (
                  <Tooltip title="واتساب">
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: '#25d366',
                        color: 'white',
                        '&:hover': { backgroundColor: '#128c7e' },
                      }}
                      onClick={() => {
                        let phone = contactInfo.whatsapp;
                        if (!phone) return;
                        if (phone.startsWith('0')) {
                          phone = '+20' + phone.slice(1);
                        }
                        window.open(`https://wa.me/${phone}`);
                      }}
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {contactInfo.email && (
                  <Tooltip title="بريد إلكتروني">
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        '&:hover': { backgroundColor: '#c0392b' },
                      }}
                      onClick={() => window.open(`mailto:${contactInfo.email}`)}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Button
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  backgroundColor: '#2c3e50',
                  '&:hover': { backgroundColor: '#34495e' },
                }}
                onClick={() => router.push(`/properties/${propertyId}`)}
              >
                عرض التفاصيل
              </Button>
            </Box>
          )}
        </CardContent>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message="تم نسخ رابط العقار!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Card>
    );
  };

const SearchPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [showFilters, setShowFilters] = useState<boolean>(true);

  
  const filterButtonsRef = useRef<HTMLDivElement>(null);


  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Pagination state and logic
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limitPerPage, setLimitPerPage] = useState<number>(12);
  const [totalProperties, setTotalProperties] = useState<number>(0);

  const totalPages = Math.ceil(totalProperties / limitPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentSearchParams = new URLSearchParams(searchParams.toString());
      currentSearchParams.set('page', currentPage.toString());
      currentSearchParams.set('limit', limitPerPage.toString());

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/properties/allProperties?${currentSearchParams.toString()}`;
      const response = await axios.get(apiUrl);

      console.log("API Response Data:", response.data);

      if (response.data.success) {
        setProperties(response.data.data);
        setTotalProperties(response.data.pagination.totalDocs);
      } else {
        setError(response.data.message || 'Failed to fetch properties.');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('An error occurred while fetching properties.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limitPerPage, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProperties();
  }, [fetchProperties, searchParams]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newSearchParams.set('search', value);
    } else {
      newSearchParams.delete('search');
    }
    router.push(`/properties?${newSearchParams.toString()}`, { scroll: false });
  };

  const handlePropertySelect = (property: Property | null) => {
    setSelectedProperty(property);
  };

  const updateFilter = (category?: 'sale' | 'rent', isStudentFriendly?: boolean) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.delete('category');
    current.delete('isStudentFriendly');

    if (category) {
      current.set('category', category);
    }
    if (isStudentFriendly) {
      current.set('isStudentFriendly', 'true');
    }

    const query = current.toString();
    const newUrl = query ? `?${query}` : '';

    router.push(`${window.location.pathname}${newUrl}`, { scroll: false });
  };

  const handleViewModeChange = (mode: 'list' | 'map') => {
    setViewMode(mode);
    setShowFilters(mode === 'list');
  };

  return (
    <>
      <Head>
        <title>عقارات للايجار والبيع في مصر | سكنلي</title>
        <meta name="description" content="ابحث عن أفضل العقارات للإيجار والبيع في مصر على منصة سكنلي. شقق، فلل، محلات، استوديوهات، ودوبلكس." />
      </Head>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        direction: 'rtl',
      }}>
        <FilterSidebar />
        <Box sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 3,
          backgroundColor: '#f8f9fa',
        }}>
          {/* Header Section */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
          }}>
            <TransitionGroup component={null}>
              {showFilters && (
                <CSSTransition nodeRef={filterButtonsRef} key="filters" timeout={300} classNames="filter-buttons">
                  <Box ref={filterButtonsRef} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant={
                        !searchParams.get('category') && !searchParams.get('isStudentFriendly')
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => updateFilter()}
                      sx={{ minWidth: '150px' }}
                    >
                      كل العقارات
                    </Button>
                    <Button
                      variant={searchParams.get('category') === 'sale' ? 'contained' : 'outlined'}
                      onClick={() => updateFilter('sale')}
                      sx={{ minWidth: '150px' }}
                    >
                      عقارات للبيع
                    </Button>
                    <Button
                      variant={searchParams.get('category') === 'rent' ? 'contained' : 'outlined'}
                      onClick={() => updateFilter('rent')}
                      sx={{ minWidth: '150px' }}
                    >
                      عقارات للإيجار
                    </Button>
                    <Button
                      variant={searchParams.get('isStudentFriendly') === 'true' ? 'contained' : 'outlined'}
                      onClick={() => updateFilter(undefined, true)}
                      sx={{ minWidth: '150px' }}
                    >
                      عقارات للطلاب
                    </Button>
                  </Box>
                </CSSTransition>
              )}
            </TransitionGroup>


            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                startIcon={<ViewListIcon />}
                onClick={() => handleViewModeChange('list')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  gap: 1,
                }}
              >
                قائمة
              </Button>
              <Button
                variant={viewMode === 'map' ? 'contained' : 'outlined'}
                startIcon={<MapIcon />}
                onClick={() => handleViewModeChange('map')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  gap: 1,
                }}
              >
                خريطة
              </Button>
            </Box>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                fontSize: '1rem',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && properties.length === 0 && totalProperties === 0 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: 2,
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                لا توجد عقارات متاحة حالياً
              </Typography>
              <Typography variant="body2" color="text.secondary">
                جرب تعديل معايير البحث أو المرشحات
              </Typography>
            </Box>
          )}

          {/* Properties Grid */}
          {!loading && !error && properties.length > 0 && viewMode === 'list' && (
            <Box display="flex" flexWrap="wrap" gap={3}>
              {properties.map((property: any) => (
                <Box key={property._id} flex="1 1 300px" minWidth={300} maxWidth={400} p={1}>
                  <EnhancedPropertyCard
                    images={Array.isArray(property.images) ? property.images.map((img: any) => img.url) : []}
                    price={property.price?.toString() || ''}
                    propertyType={property.type || ''}
                    beds={property.bedrooms || 0}
                    baths={property.bathrooms || 0}
                    sqft={property.area?.toString() || ''}
                    description={property.description || ''}
                    location={{
                      address: property.location?.address || '',
                      city: property.location?.city || '',
                    }}
                    initialPaymentAmount={property.category === 'rent' ?
                      (property.deposit?.toString() || '') :
                      property.category === 'sale' ?
                        (property.downPayment?.toString() || '') :
                        ''
                    }
                    statusTag={property.status || ''}
                    category={property.category || ''}
                    contactInfo={
                      property.contactInfo ? {
                        phone: property.contactInfo.phone || '',
                        email: property.contactInfo.email,
                        whatsapp: property.contactInfo.whatsapp,
                      } : undefined
                    }
                    propertyId={property._id}
                    title={property.title || ''}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Map View */}
          {!loading && !error && properties.length > 0 && viewMode === 'map' && (
            <Box sx={{ height: '600px', borderRadius: 2, overflow: 'hidden' }}>
              <PropertyMap
                properties={properties}
                onPropertySelect={handlePropertySelect}
                selectedProperty={selectedProperty}
              />
            </Box>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 5,
              mb: 3,
            }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontWeight: 'bold',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};


export default SearchPage;