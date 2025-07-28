"use client";
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "next/navigation";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Chip, 
  Paper, 
  Divider, 
  Button,
  Grid,
  Card,
  CardContent,
  Fab,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Stack,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import Image from "next/image";
import Head from "next/head";
import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PoolIcon from '@mui/icons-material/Pool';
import ElevatorIcon from '@mui/icons-material/Elevator';
import BalconyIcon from '@mui/icons-material/Balcony';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PropertyCard from '@/shared/components/PropertyCard';
import propertyService from '@/shared/services/propertyService';
import { Property as SharedProperty } from '@/shared/types';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '@/app/context/AuthContext';
import { useWishlist } from '@/app/context/WishlistContext';
import { useToast } from '@/shared/provider/ToastProvider';
import PropertyLocationMap from '@/shared/components/PropertyLocationMap';

// Dynamic imports for performance
const MortgageCalculator = dynamic(() => import('@/shared/components/MortgageCalculator'), {
  loading: () => <CircularProgress />, 
  ssr: false
});

const CommentSection = dynamic(() => import('@/shared/components/CommentSection'), {
  loading: () => <Skeleton variant="rectangular" height={200} />, 
  ssr: false
});

interface Property {
  _id: string;
  title: string;
  description: string;
  price: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  type: string;
  category: string;
  location: { 
    city: string; 
    address: string; 
    latitude?: number;
    longitude?: number;
    coordinates?: { latitude: number; longitude: number } 
  };
  images: Array<{ url: string; isMain: boolean }>;
  status: string;
  isApproved: boolean;
  downPayment?: number;
  installmentPeriodInYears?: number;
  contactInfo?: {
    phone: string;
    email: string;
    agent?: {
      name: string;
      photo: string;
      title: string;
  };
  };
  amenities?: string[];
  yearBuilt?: number;
  propertyId?: string;
  views?: number;
  lastUpdated?: string;
  owner?: {
    _id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
  };
}

const PropertyDetailsPage: React.FC = () => {
  const params = useParams();
  const { id } = params as { id: string };
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const propertyId = id;

  useEffect(() => {
    if (id) fetchProperty();
    // Add to recently viewed
    if (id) {
      let viewed = JSON.parse(localStorage.getItem("recentlyViewedProperties") || "[]");
      if (!Array.isArray(viewed)) viewed = [];
      viewed.unshift(id);
      viewed = viewed.slice(0, 10); // Keep only last 10
      localStorage.setItem("recentlyViewedProperties", JSON.stringify(viewed));
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/propertyDetails/${id}`);
      if (!response.ok) throw new Error("فشل في جلب بيانات العقار");
      const data = await response.json();
      if (data.success && data.data) {
        setProperty(data.data);
      } else {
        setError("العقار غير موجود أو غير متاح");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  // Share functionality
  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const text = `تحقق من هذا العقار: ${property?.title}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'copy':
      default:
        await navigator.clipboard.writeText(url);
        showToast('تم نسخ رابط العقار!', 'success');
        break;
    }
  };

  // Lightbox functionality
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const prevImg = () => setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  const nextImg = () => setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));

  // Wishlist functionality
  const isFavorite = isInWishlist(propertyId);
  const toggleFavorite = async () => {
    if (!property) return;
    
    if (isFavorite) {
      await removeFromWishlist(propertyId);
    } else {
      const success = await addToWishlist({
        id: propertyId,
        title: property.title,
        price: property.price,
        location: property.location,
        images: property.images,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        type: property.type,
        category: property.category
      });
      if (success) {
        showToast('تمت الإضافة إلى قائمة الأمنيات!', 'success');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="xl">
          <Box display={{ md: 'flex' }} gap={4}>
            <Box flex={2} minWidth={0}>
              <Skeleton 
                variant="rectangular" 
                height={400} 
                sx={{ borderRadius: 4, mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} 
              />
              <Skeleton 
                variant="rectangular" 
                height={80} 
                sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} 
              />
              <Skeleton 
                variant="text" 
                height={60} 
                sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)' }} 
              />
              <Skeleton 
                variant="text" 
                height={40} 
                sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} 
              />
              <Skeleton 
                variant="rectangular" 
                height={200} 
                sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }} 
              />
            </Box>
            <Box flex={1} minWidth={0}>
              <Paper sx={{ p: 3, position: 'sticky', top: 20, bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <Skeleton 
                  variant="rectangular" 
                  height={200} 
                  sx={{ borderRadius: 2, bgcolor: 'rgba(0,0,0,0.1)' }} 
                />
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}>
        <Container maxWidth="xl">
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3
            }}
          >
            {error || "العقار غير متاح"}
          </Alert>
        </Container>
      </Box>
    );
  }

  const mainImage = property.images?.find(img => img.isMain)?.url || property.images?.[0]?.url || "/images/placeholder.jpg";
  const allImages = property.images?.map(img => img.url) || [mainImage];

  // Sample amenities for demo
  const amenities = property.amenities || [
    'موقف سيارات',
    'مصعد',
    'أمن وحراسة',
    'حديقة',
    'بلكونة',
    'تكييف',
    'صالة رياضية',
    'حمام سباحة',
    'إنترنت',
    'غاز طبيعي'
  ];

  const amenityIcons: Record<string, any> = {
    'موقف سيارات': LocalParkingIcon,
    'مصعد': ElevatorIcon,
    'أمن وحراسة': SecurityIcon,
    'حديقة': LocalParkingIcon,
    'بلكونة': BalconyIcon,
    'تكييف': AcUnitIcon,
    'صالة رياضية': FitnessCenterIcon,
    'حمام سباحة': PoolIcon,
    'إنترنت': CheckCircleIcon,
    'غاز طبيعي': CheckCircleIcon,
  };

  return (
    <>
      <Head>
        <title>{property.title} | تفاصيل العقار</title>
        <meta name="description" content={property.description?.slice(0, 150)} />
        <meta property="og:title" content={property.title} />
        <meta property="og:description" content={property.description?.slice(0, 150)} />
        <meta property="og:image" content={mainImage} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
      </Head>
      
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}>
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          {/* Enhanced Breadcrumbs */}
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'var(--card-bg)',
            borderRadius: 3,
            border: '1px solid var(--border-light)'
          }}>
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />} 
              aria-label="breadcrumb"
            >
              <Link color="inherit" href="/" sx={{ textDecoration: 'none', '&:hover': { color: '#667eea' } }}>
              الرئيسية
            </Link>
              <Link color="inherit" href="/properties" sx={{ textDecoration: 'none', '&:hover': { color: '#667eea' } }}>
              العقارات
            </Link>
              <Link color="inherit" href={`/properties?city=${property.location?.city}`} sx={{ textDecoration: 'none', '&:hover': { color: '#667eea' } }}>
                {property.location?.city}
              </Link>
              <Typography color="text.primary" fontWeight="bold">{property.title}</Typography>
          </Breadcrumbs>
          </Paper>

          <Box display={{ md: 'flex' }} gap={4}>
            {/* Main Content */}
            <Box flex={2} minWidth={0}>
              {/* Enhanced Property Header */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                bgcolor: 'var(--card-bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography 
                      variant="h5" 
                      component="h1" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{
                        color: 'var(--text-primary)',
                        mb: 1,
                        fontSize: '1.3rem'
                      }}
                    >
                      {property.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ 
                        p: 0.5, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <LocationOnIcon sx={{ color: '#667eea', mr: 1 }} fontSize="small" />
                        <Typography variant="body1" color="text.secondary" fontWeight="medium">
                          {property.location?.address}, {property.location?.city}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 2 }}>
                      <Chip 
                        label={`المشاهدات: ${property.views || Math.floor(Math.random() * 500) + 50}`}
                        sx={{ 
                          bgcolor: 'rgba(118, 75, 162, 0.1)',
                          color: '#764ba2',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          height: 28
                        }}
                      />
                    </Stack>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}>
                      <IconButton 
                        onClick={toggleFavorite} 
                        sx={{
                          bgcolor: isFavorite ? 'rgba(244, 67, 54, 0.1)' : 'rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: isFavorite ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isFavorite ? 
                          <FavoriteIcon sx={{ color: '#f44336' }} /> : 
                          <FavoriteBorderIcon sx={{ color: '#f44336' }} />
                        }
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="مشاركة">
                      <IconButton 
                        onClick={() => handleShare('copy')}
                        sx={{
                          bgcolor: 'rgba(33, 150, 243, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(33, 150, 243, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <ShareIcon sx={{ color: '#2196f3' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Enhanced Price and Key Stats */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  
                  gap: 2, 
                  mb: 2, 
                  flexWrap: 'wrap',
                  p: 1.5, 
                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 1,
                    borderRadius: 2,
                    color: 'var(--text-primary)',
                    minWidth: 120
                  }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                      {property.price}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                      جنيه مصري
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip 
                      icon={<BedIcon />} 
                      label={`${property.bedrooms} غرفة`} 
                      sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        color: '#4caf50',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        height: 28,
                        gap: 1,
                        flexDirection: 'row-reverse'
                      }}
                    />
                    <Chip 
                      icon={<BathtubIcon />} 
                      label={`${property.bathrooms} حمام`} 
                      sx={{ 
                        bgcolor: 'rgba(33, 150, 243, 0.1)',
                        color: '#2196f3',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        height: 28,
                        gap: 1,
                        flexDirection: 'row-reverse'
                      }}
                    />
                    <Chip 
                      icon={<SquareFootIcon />} 
                      label={`${property.area} م²`} 
                      sx={{ 
                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                        color: '#ff9800',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        height: 28,
                        gap: 1,
                        flexDirection: 'row-reverse'
                      }}
                    />
                    <Chip 
                      label={property.category === 'sale' ? 'للبيع' : property.category === 'rent' ? 'للإيجار' : 'سكن طلبة'} 
                      sx={{ 
                        bgcolor: property.category === 'sale' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                        color: property.category === 'sale' ? '#9c27b0' : '#4caf50',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        height: 28,
                        gap: 1,
                        flexDirection: 'row-reverse'
                      }}
                    />
                  </Stack>
                </Box>
              </Paper>

              {/* Enhanced Image Gallery */}
              <Paper sx={{ 
                p: 1.5, 
                mb: 2, 
                bgcolor: '#f0f0f0',
                borderRadius: 4,
                border: '1px solid #CCC',
                overflow: 'hidden'
              }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.1rem'
                }}>
                  معرض الصور
                </Typography>
                <Box sx={{ position: 'relative', mb: 3 }}>
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                navigation
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper }}
                style={{ 
                  height: '320px',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                {allImages.map((img, idx) => (
                      <SwiperSlide key={idx}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        position: 'relative', 
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.02)',
                        transition: 'transform 0.3s ease'
                            }
                      }} 
                      onClick={() => openLightbox(idx)}
                    >
                      <Image 
                        src={img} 
                        alt={`صورة ${idx + 1}`} 
                        fill 
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 66vw"
                        priority={idx === 0} 
                          />
              <Box sx={{ 
                position: 'absolute', 
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                            p: 2,
                            color: 'white'
                          }}>
                            <Typography variant="h6" fontWeight="bold">
                              صورة {idx + 1} من {allImages.length}
                </Typography>
              </Box>
                        </Box>
                      </SwiperSlide>
                    ))}
                  </Swiper>
            </Box>
            
                {/* Enhanced Thumbnail Gallery */}
                <Swiper
                  modules={[Navigation, Thumbs]}
                  onSwiper={setThumbsSwiper}
                  spaceBetween={8}
                  slidesPerView={4}
                  navigation
                  breakpoints={{
                    320: { slidesPerView: 2 },
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 }
                  }}
                  style={{ height: '60px' }}
                >
                  {allImages.map((img, idx) => (
                    <SwiperSlide key={idx} style={{ cursor: 'pointer' }}>
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        position: 'relative', 
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '3px solid transparent',
                        '&:hover': {
                          border: '3px solid #667eea',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <Image 
                          src={img} 
                          alt={`صورة مصغرة ${idx + 1}`} 
                          fill 
                          style={{ objectFit: 'cover' }}
                          sizes="120px"
                        />
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Paper>

              {/* Enhanced Description */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                bgcolor: 'var(--card-bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                  وصف العقار
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    lineHeight: 1.5,
                    fontSize: '0.95rem',
                    display: showFullDescription ? 'block' : '-webkit-box',
                    WebkitLineClamp: showFullDescription ? 'none' : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {property.description || 'لا يوجد وصف متاح لهذا العقار.'}
                </Typography>
                {property.description && property.description.length > 200 && (
                  <Button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    sx={{ 
                      mt: 1,
                      color: '#667eea',
                      fontSize: '0.9rem',
                      '&:hover': {
                        bgcolor: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                    startIcon={<ExpandMoreIcon sx={{ 
                      transform: showFullDescription ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }} />}
                  >
                    {showFullDescription ? 'عرض أقل' : 'عرض المزيد'}
                  </Button>
            )}
          </Paper>

              {/* Enhanced Property Details */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                bgcolor: 'var(--card-bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)'
              }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                  تفاصيل العقار
                      </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 180px', minWidth: 140, p: 1, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">النوع</Typography>
                    <Typography variant="body1" fontWeight="bold" color="#667eea">
                      {property.type}
                        </Typography>
                      </Box>
                  <Box sx={{ flex: '1 1 180px', minWidth: 140, p: 1, bgcolor: 'rgba(118, 75, 162, 0.05)', borderRadius: 2, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">المساحة</Typography>
                    <Typography variant="body1" fontWeight="bold" color="#764ba2">
                      {property.area} م²
                            </Typography>
                          </Box>
                  <Box sx={{ flex: '1 1 180px', minWidth: 140, p: 1, bgcolor: 'rgba(240, 147, 251, 0.05)', borderRadius: 2, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">الغرف</Typography>
                    <Typography variant="body1" fontWeight="bold" color="#f093fb">
                      {property.bedrooms} غرفة
                            </Typography>
                          </Box>
                  <Box sx={{ flex: '1 1 180px', minWidth: 140, p: 1, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 2, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">الحمامات</Typography>
                    <Typography variant="body1" fontWeight="bold" color="#2196f3">
                      {property.bathrooms} حمام
                    </Typography>
                      </Box>
                  <Box sx={{ flex: '1 1 180px', minWidth: 140, p: 1, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 2, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">سنة البناء</Typography>
                    <Typography variant="body1" fontWeight="bold" color="#4caf50">
                      {property.yearBuilt || '2020'}
                    </Typography>
                    </Box>
                  <Box sx={{ flex: '1 1 180px', minWidth: 140, p: 1, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: 2, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">الحالة</Typography>
                    <Chip 
                      label={property.status === 'available' ? 'متاح' : 'غير متاح'} 
                          sx={{ 
                        bgcolor: property.status === 'available' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        color: property.status === 'available' ? '#4caf50' : '#f44336',
                        fontWeight: 'bold',
                        gap: 2,
                        flexDirection: 'row-reverse'
                      }}
                    />
                    </Box>
                  </Box>
              </Paper>

              {/* Enhanced Amenities */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                bgcolor: 'var(--card-bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)'
              }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                  المرافق والخدمات
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {amenities.slice(0, showAllAmenities ? amenities.length : 6).map((amenity, idx) => {
                    const IconComponent = amenityIcons[amenity] || CheckCircleIcon;
                    return (
                      <Paper key={idx} sx={{ 
                        flex: '1 1 120px',
                        minWidth: 100,
                        p: 1, 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: 2,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        fontSize: '0.95rem',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)'
                        }
                      }}>
                        <Box sx={{ 
                          mr: 1,
                          p: 0.5,
                          bgcolor: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent sx={{ color: '#667eea' }} />
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                          <span style={{ fontSize: '0.95rem' }}>
                          {amenity}
                          </span>
                    </Typography>
                      </Paper>
                    );
                  })}
                  </Box>
                {amenities.length > 6 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button 
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      sx={{ 
                        color: '#667eea',
                        fontSize: '0.9rem',
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                      startIcon={<ExpandMoreIcon sx={{ 
                        transform: showAllAmenities ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }} />}
                    >
                      {showAllAmenities ? 'عرض أقل' : `عرض المزيد (${amenities.length - 6})`}
                    </Button>
                  </Box>
                )}
                </Paper>

              {/* Enhanced Map */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                bgcolor: 'var(--card-bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)'
              }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                    الموقع على الخريطة
                  </Typography>
                  {property.location?.latitude && property.location?.longitude ? (
                    <Box sx={{ 
                      height: 260, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.12)',
                      border: '1px solid rgba(102, 126, 234, 0.12)'
                    }}>
                      <PropertyLocationMap
                        latitude={property.location.latitude}
                        longitude={property.location.longitude}
                        title={property.title}
                        address={property.location.address}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      height: 180, 
                      bgcolor: 'rgba(102, 126, 234, 0.05)', 
                      borderRadius: 2,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px dashed rgba(102, 126, 234, 0.2)'
                    }}>
                      <Typography color="text.secondary">
                        خريطة العقار ستظهر هنا عند توفر الإحداثيات
                      </Typography>
                    </Box>
                  )}
                </Paper>

              {/* Enhanced Comments Section */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                bgcolor: 'var(--card-bg)',
                borderRadius: 4,
                border: '1px solid var(--border-light)'
              }}>
                <CommentSection
                  propertyId={property._id}
                  isAuthenticated={!!user}
                  userName={user?.userName}
                  userEmail={user?.email}
                />
              </Paper>
            </Box>

            {/* Sidebar */}
            <Box flex={1} minWidth={0} sx={{ position: 'sticky', top: 20 }}>
              {/* Enhanced Contact Agent Card */}
              <Card sx={{ 
                mb: 4, 
                borderRadius: 4,
                bgcolor: 'var(--card-bg)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 4px var(--card-shadow)',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  transition: 'transform 0.3s ease'
                }
              }}>
                <Box sx={{
                  height: '8px',
                  background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)'
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      ml: 1,
                      background: 'linear-gradient(45deg, #667eea,)'
                    }}>
                      {(property.owner?.firstName?.charAt(0) || property.owner?.userName?.charAt(0) || 'ص')}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="#667eea">
                        {property.owner?.firstName || property.owner?.userName ? `${property.owner?.firstName || ''} ${property.owner?.lastName || ''}`.trim() || property.owner?.userName : 'صاحب العقار'}
                  </Typography>
                    </Box>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<CallIcon />}
                      href={`tel:${property.contactInfo?.phone || ''}`}
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: '#4caf50',
                        '&:hover': {
                          bgcolor: '#388e3c'
                        },
                        py: 1.5,
                        gap: 2
                      }}
                    >
                      اتصال مباشر
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<WhatsAppIcon />}
                      href={`https://wa.me/${property.contactInfo?.phone || ''}`}
                      target="_blank"
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: '#25d366',
                        '&:hover': {
                          bgcolor: '#128c7e'
                        },
                        py: 1.5,
                        gap: 2
                      }}
                    >
                      واتساب
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<EmailIcon />}
                      href={`mailto:${property.contactInfo?.email || ''}`}
                      sx={{ 
                        borderRadius: 2,
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.1)',
                          borderColor: '#764ba2'
                        },
                        py: 1.5,
                        gap: 2
                      }}
                    >
                      بريد إلكتروني
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Enhanced Quick Actions */}
              <Card sx={{ 
                mb: 4, 
                borderRadius: 4,
                bgcolor: 'var(--card-bg)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 4px var(--card-shadow)'
              }}>
                {/* تم حذف قسم إجراءات معاينة بناءً على طلب المستخدم */}
              </Card>

              {/* Enhanced Share Options */}
              <Card sx={{ 
                mb: 4, 
                borderRadius: 4,
                bgcolor: 'var(--card-bg)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 4px var(--card-shadow)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    color: '#f093fb',
                    mb: 3
                  }}>
                    مشاركة العقار
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ gap: 2 }}>
                    <Tooltip title="نسخ الرابط">
                      <IconButton 
                        onClick={() => handleShare('copy')} 
          sx={{ 
                          bgcolor: 'rgba(33, 150, 243, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(33, 150, 243, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <ContentCopyIcon sx={{ color: '#2196f3' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="واتساب">
            <IconButton 
                        onClick={() => handleShare('whatsapp')} 
              sx={{ 
                          bgcolor: 'rgba(37, 211, 102, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(37, 211, 102, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <WhatsAppIcon sx={{ color: '#25d366' }} />
            </IconButton>
                    </Tooltip>
                    <Tooltip title="فيسبوك">
                <IconButton 
                        onClick={() => handleShare('facebook')} 
                  sx={{ 
                          bgcolor: 'rgba(59, 89, 152, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(59, 89, 152, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FacebookIcon sx={{ color: '#3b5998' }} />
                </IconButton>
                    </Tooltip>
                    <Tooltip title="تويتر">
                <IconButton 
                        onClick={() => handleShare('twitter')} 
                  sx={{ 
                          bgcolor: 'rgba(29, 161, 242, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(29, 161, 242, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <TwitterIcon sx={{ color: '#1da1f2' }} />
                </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>

              {/* Enhanced Mortgage Calculator */}
              <Card sx={{ 
                mb: 4, 
                borderRadius: 4,
                bgcolor: 'var(--card-bg)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 4px var(--card-shadow)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    color: '#667eea',
                    mb: 3
                  }}>
                    حساب الرهن العقاري
                  </Typography>
                  <MortgageCalculator 
                    price={Number(property.price)}
                    downPayment={property.downPayment ?? 0}
                    termInYears={property.installmentPeriodInYears ?? 0}
                  />
                </CardContent>
              </Card>

              {/* Property Inquiry Form */}
              <Card sx={{ mb: 4, borderRadius: 4, bgcolor: 'var(--card-bg)', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px var(--card-shadow)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#764ba2', mb: 3 }}>
                    أرسل استفسار عن هذا العقار
                  </Typography>
                  <PropertyInquiryForm propertyId={property._id} />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default PropertyDetailsPage;

// Property Inquiry Form Component
import TextField from '@mui/material/TextField';
import axios from 'axios';

const PropertyInquiryForm: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name || form.name.length < 2 || form.name.length > 50) return 'الاسم يجب أن يكون بين 2 و50 حرفاً';
    if (!form.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) return 'يرجى إدخال بريد إلكتروني صحيح';
    if (!form.phone || !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(form.phone)) return 'يرجى إدخال رقم هاتف صحيح';
    if (!form.message || form.message.length < 10 || form.message.length > 500) return 'الرسالة يجب أن تكون بين 10 و500 حرف';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/property-inquiry/add-property-inquiry`, {
        property: propertyId,
        ...form
      });
      if (res.data.success) {
        setSuccess('تم إرسال الاستفسار بنجاح! سيتم التواصل معك قريباً.');
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        setError(res.data.message || 'حدث خطأ أثناء إرسال الاستفسار');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء إرسال الاستفسار');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Stack spacing={2}>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          name="name"
          label="الاسم"
          value={form.name}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="email"
          label="البريد الإلكتروني"
          value={form.email}
          onChange={handleChange}
          required
          type="email"
          fullWidth
        />
        <TextField
          name="phone"
          label="رقم الهاتف"
          value={form.phone}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="message"
          label="رسالتك"
          value={form.message}
          onChange={handleChange}
          required
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.5 }}
        >
          {loading ? 'جاري الإرسال...' : 'إرسال الاستفسار'}
        </Button>
      </Stack>
    </form>
  );
};