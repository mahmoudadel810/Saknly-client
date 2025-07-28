import React, { useState } from 'react';
import { Box, IconButton, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Typography from '@mui/material/Typography';

interface GalleryProps {
  images: { url: string; isMain?: boolean }[];
  title: string;
}

const PropertyGallery: React.FC<GalleryProps> = ({ images, title }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const mainImage = images.find(img => img.isMain)?.url || images?.[0]?.url || "/images/placeholder.jpg";
  const allImages = images.map(img => img.url) || [mainImage];

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
      {/* Main Swiper */}
      <Box sx={{ position: 'relative', height: { xs: 350, md: 500 } }}>
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{ clickable: true }}
          thumbs={{ swiper: thumbsSwiper }}
          style={{ height: '100%' }}
        >
          {allImages.map((img, idx) => (
            <SwiperSlide key={idx}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '100%',
                  cursor: 'zoom-in'
                }}
                onClick={() => openLightbox(idx)}
              >
                <Image
                  src={img}
                  alt={`${title} - صورة ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 10
                }}>
                  <ZoomInIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {idx + 1}/{allImages.length}
                  </Typography>
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation */}
        <IconButton className="swiper-button-prev-custom" sx={navButtonStyle('left')}>
          <ArrowBackIosNewIcon sx={{ color: 'white' }} />
        </IconButton>
        <IconButton className="swiper-button-next-custom" sx={navButtonStyle('right')}>
          <ArrowForwardIosIcon sx={{ color: 'white' }} />
        </IconButton>
      </Box>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={4}
            breakpoints={{ 640: { slidesPerView: 6 }, 1024: { slidesPerView: 8 } }}
          >
            {allImages.map((img, idx) => (
              <SwiperSlide key={idx}>
                <Box sx={{ 
                  position: 'relative', 
                  height: 80, 
                  borderRadius: 1, 
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: 'transparent',
                  '&:hover': { borderColor: 'primary.main' },
                  cursor: 'pointer'
                }}>
                  <Image 
                    src={img} 
                    alt={`صورة مصغرة ${idx + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      )}

      {/* Lightbox */}
      {/*
      {lightboxOpen && (
        <Lightbox 
          images={allImages} 
          index={lightboxIndex}
          title={title}
          onClose={() => setLightboxOpen(false)}
          onChange={(idx) => setLightboxIndex(idx)}
        />
      )}
      */}
    </Paper>
  );
};

// Navigation button style
const navButtonStyle = (position: 'left' | 'right') => ({
  position: 'absolute',
  top: '50%',
  [position]: 16,
  transform: 'translateY(-50%)',
  zIndex: 10,
  bgcolor: 'rgba(0,0,0,0.5)',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
  width: 40,
  height: 40
});

export default PropertyGallery;