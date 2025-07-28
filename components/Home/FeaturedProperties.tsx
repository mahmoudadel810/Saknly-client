'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  IconButton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import PropertyCard from '../../shared/components/homeCard';

// Define tab types to match backend categories
const tabTypes = ['all', 'rent', 'sale'];

const FeaturedProperties = () => {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedTab = useRef(-1);
  const swiperRef = useRef<any>(null);

  const fetchProperties = async (type: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1';
      if (!apiUrl) {
        setError('Error: API URL not defined.');
        setLoading(false);
        return;
      }

      let url: string;
      if (type === 'all') {
        // For 'الكل' tab, get all featured properties
        url = `${apiUrl}/properties/featured?limit=8`;
      } else {
        // For 'ايجار' and 'بيع', get featured properties and filter by category on frontend
        url = `${apiUrl}/properties/featured?limit=20`; // Get more to filter from
      }

      const res = await axios.get(url);
      let filteredProperties = Array.isArray(res.data.data) ? res.data.data : [];
      
      // If not 'all', filter by category on frontend
      if (type !== 'all') {
        filteredProperties = filteredProperties.filter((property: any) => 
          property.category === type
        ).slice(0, 8); // Limit to 8 after filtering
      }

      setProperties(filteredProperties);
    } catch (err) {
      console.error('فشل في تحميل العقارات:', err);
      setError('فشل في تحميل العقارات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lastFetchedTab.current !== activeTab) {
      lastFetchedTab.current = activeTab;
      fetchProperties(tabTypes[activeTab]);
    }
  }, [activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleViewAllClick = () => {
    router.push('/properties');
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>جاري تحميل العقارات...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (properties.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: '#f7f7f7',
          py: 5,
          px: { xs: 2, sm: 4 },
          borderRadius: 4,
          my: 6,
          textAlign: 'center',
          maxWidth: '100%',
          mx: 'auto',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          لا توجد عقارات مميزة متاحة حاليًا.
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleViewAllClick}
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
            borderRadius: 2,
            px: { xs: 3, sm: 5 },
            py: 1.5,
            mt: 3,
          }}
        >
          عرض جميع العقارات
        </Button>
      </Box>
    );
  }

  return (
    <Box
      className="bg-white dark:bg-[#1f2937]"
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        transition: 'background 0.3s',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: { xs: 3, md: 5 },
            px: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="h2"
            className="text-black dark:text-white"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
              letterSpacing: '0.5px',
              textAlign: 'center',
              transition: 'color 0.3s',
            }}
          >
            وحداتنا المميزة
          </Typography>
          <Typography
            variant="body1"
            className="text-neutral-700 dark:text-neutral-300"
            sx={{
              fontSize: { xs: '1rem', sm: '1.08rem', md: '1.12rem' },
              textAlign: 'center',
              mb: { xs: 2.5, md: 3.5 },
              maxWidth: 600,
              transition: 'color 0.3s',
            }}
          >
            أفضل العقارات المميزة للإيجار والبيع في مصر
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ 
          mb: { xs: 4, sm: 5, md: 6 }, 
          display: 'flex', 
          justifyContent: 'center',
          px: { xs: 1, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', gap: 1, bgcolor: 'grey.100', borderRadius: 2, p: 0.5 }}>
            {['الكل', 'ايجار', 'بيع'].map((label, index) => (
              <Button
                key={label}
                variant={activeTab === index ? 'contained' : 'text'}
                onClick={() => handleTabChange({} as React.SyntheticEvent, index)}
                sx={{
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  textTransform: 'none',
                  minWidth: { xs: 80, sm: 100 },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Slider Container */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: 0, sm: 2, md: 0 },
          }}
        >
          {/* Navigation Arrows */}
          <IconButton
            aria-label="السابق"
            onClick={handlePrev}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              left: { sm: -16, md: -50 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.9)',
              boxShadow: 1,
              borderRadius: '50%',
              width: { sm: 36, md: 44 },
              height: { sm: 36, md: 44 },
              border: '1px solid #e3eaf6',
              transition: 'all 0.18s',
              color: '#2563eb',
              '&:hover': {
                bgcolor: '#e3eaf6',
                color: '#174ea6',
                borderColor: '#b6c6e3',
                boxShadow: 2,
              },
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: { sm: 16, md: 20 } }} />
          </IconButton>

          <IconButton
            aria-label="التالي"
            onClick={handleNext}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              right: { sm: -16, md: -50 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.9)',
              boxShadow: 1,
              borderRadius: '50%',
              width: { sm: 36, md: 44 },
              height: { sm: 36, md: 44 },
              border: '1px solid #e3eaf6',
              transition: 'all 0.18s',
              color: '#2563eb',
              '&:hover': {
                bgcolor: '#e3eaf6',
                color: '#174ea6',
                borderColor: '#b6c6e3',
                boxShadow: 2,
              },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: { sm: 16, md: 20 } }} />
          </IconButton>

          {/* Swiper Slider */}
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              480: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
            }}
            style={{
              padding: '10px 0 30px',
              width: '100%',
              overflow: 'visible',
            }}
          >
            {properties.map((property: any) => (
              <SwiperSlide key={property._id || property.id}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <PropertyCard property={property} />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Pagination */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
              '.swiper-pagination-bullet': {
                width: 8,
                height: 8,
                bgcolor: '#e3eaf6',
                opacity: 1,
                transition: 'all 0.2s',
                mx: '4px !important',
              },
              '.swiper-pagination-bullet-active': {
                bgcolor: 'primary.main',
                width: 24,
                borderRadius: 4,
              },
            }}
          >
            <div className="swiper-pagination" />
          </Box>
        </Box>

        {/* Call to action */}
        <Box
          sx={{
            mt: { xs: 3, md: 5 },
            textAlign: 'center',
            px: { xs: 1, sm: 0 },
          }}
        >
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleViewAllClick}
            sx={{
              fontWeight: 800,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.08rem' },
              borderRadius: 3,
              px: { xs: 3, sm: 5 },
              py: 1.5,
              bgcolor: 'error.main',
              boxShadow: '0 4px 16px 0 rgba(220,38,38,0.10)',
              letterSpacing: '0.15px',
              textTransform: 'none',
              transition: 'all 0.18s',
              '&:hover': {
                bgcolor: 'error.dark',
                color: 'white',
                boxShadow: '0 8px 32px 0 rgba(220,38,38,0.18)',
                transform: 'translateY(-2px) scale(1.04)',
              },
            }}
          >
            عرض جميع العقارات
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProperties;
