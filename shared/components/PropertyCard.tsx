"use client";

import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, IconButton, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed'; 
import BathtubIcon from '@mui/icons-material/Bathtub'; 
import SquareFootIcon from '@mui/icons-material/SquareFoot'; 
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; 
import EmailIcon from '@mui/icons-material/Email'; 

interface PropertyCardProps {
  images: string[];
  price: string; 
  propertyType: string;
  beds: number;
  baths: number;
  sqft: string; 
  description: string;
  location: { 
    address: string;
    city: string;
  };
  initialPaymentAmount: string; 
  deposit?: number;
  downPayment?: number;
  statusTag: string; 
  category: string; 
   contactInfo?: { 
    phone: string;
    email?: string; 
    whatsapp?: string; 
  };
}


const getTranslatedStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'للبيع': return 'للبيع';
    case 'للإيجار': return 'للإيجار';
    case 'سكن طلاب': return 'سكن طلاب';
    case 'متاح': return 'متاح';
    case 'معلق': return 'معلق';
    case 'تم التأجير': return 'تم التأجير';
    case 'تم البيع': return 'تم البيع';
    case 'available': return 'متاح';
    case 'pending': return 'معلق';
    case 'rented': return 'تم التأجير';
    case 'sold': return 'تم البيع';
    default: return status;
  }
};


const PropertyCard: React.FC<PropertyCardProps> = ({
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
  contactInfo = { phone: '' },
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavoriteClick = () => {
    setIsFavorite(prev => !prev);
  };

  const goToNextImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const goToPreviousImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  const handleCardClick = () => {
    console.log('Card clicked!');
  };

  const displayImage = (images && images.length > 0) ? images[currentImageIndex] : '/images/placeholder.jpg'; 


// ---------- implementing contact info with default values ----------

  const defaultWhatsappNumber = '01012852525'; 
  const defaultEmail = 'tasbih.attia@gmail.com'; 

 const sanitizePhoneNumber = (phoneNumber: string | undefined): string => {
    if (!phoneNumber) return '';

    const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, '');
    if (cleanedNumber.startsWith('00')) {
      return cleanedNumber.substring(2); 
    }
    if (cleanedNumber.startsWith('0')) {
        return cleanedNumber;
    }
    return cleanedNumber;
  };

  
  const cleanWhatsappNumber = sanitizePhoneNumber(contactInfo.whatsapp || defaultWhatsappNumber);
  const whatsappLink = `https://wa.me/${cleanWhatsappNumber}`;
 
  const emailRecipient = contactInfo.email || defaultEmail;
  const emailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailRecipient)}`;
  


  return (
    <Card
      onClick={handleCardClick} 
      className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-lg dark:shadow-dark-900/20"
      sx={{
        width: 1000, 
        height: 290,
        display: 'flex',
        flexDirection: 'row',
        borderRadius: '12px',
        direction: 'rtl',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out', 
        '&:hover': {
          boxShadow: '0 12px 36px rgba(0,0,0,0.15)', 
        },
      }}
    >
      {/* Right Section (Image Slider) */}
      <Box sx={{
        flex: '0 0 35%', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CardMedia
          component="img"
          image={displayImage}
          alt={description}
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Status Tag */}
        <Typography
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            px: 1.5,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            zIndex: 1,
          }}
        >
          {getTranslatedStatus(statusTag)} 
        </Typography>

        {/* Favorite Icon */}
        <IconButton
          aria-label="add to favorites"
          onClick={(e) => { e.stopPropagation(); handleFavoriteClick(); }} 
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            p: 0.5,
            borderRadius: '50%',
          }}
        >
          {isFavorite ? (
            <FavoriteIcon sx={{ color: 'red' }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: 'text.secondary' }} />
          )}
        </IconButton>

        {/* Slider Navigation - Previous (Right for RTL) */}
        {images && images.length > 1 && (
          <IconButton
            onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }} 
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8, 
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
              zIndex: 1,
            }}
          >
            <ArrowForwardIosIcon fontSize="small" /> 
          </IconButton>
        )}

        {/* Slider Navigation - Next (Left for RTL) */}
        {images && images.length > 1 && (
          <IconButton
            onClick={(e) => { e.stopPropagation(); goToNextImage(); }} 
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8, 
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
              zIndex: 1,
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" /> 
          </IconButton>
        )}
      </Box>

      {/* Left Section (Details) */}
      <CardContent
        sx={{
          flex: '0 0 65%', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '300px', 
        }}
      >
        <Box>
          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black', fontSize: '2rem' }}> 
              {price} 
            </Typography>
            <Typography variant="body1" sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }}>
              ج.م
            </Typography>
          </Box>

          {/* Property Type and Specs */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'black' }}>
              {propertyType}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BedIcon sx={{ mr: 0.5, fontSize: 18, color: 'text.secondary' }} /> 
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                {beds} غرف 
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BathtubIcon sx={{ mr: 0.5, fontSize: 18, color: 'text.secondary' }} /> 
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                {baths} حمامات 
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SquareFootIcon sx={{ mr: 0.5, fontSize: 18, color: 'text.secondary' }} /> 
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                المساحة: {sqft} متر مربع 
              </Typography>
            </Box>
          </Box>

          {/* Description */}
          <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {description}
          </Typography>

          {/* Location - Displaying both city and address */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <LocationOnIcon sx={{ mr: 0.5, ml: 0, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              {location.city}, {location.address} {/* Display city and address */}
            </Typography>
          </Box>

          {/* Initial Payment (DownPayment/Deposite) - Always shown, label changes */}
          <Box sx={{
            display: 'flex',
            alignItems: 'baseline',
            mb: 2,
            p: 1,
            borderRadius: '4px',
            backgroundColor: '#e6f7ff',
            width: 'fit-content',
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black', fontSize: '1.1rem' }}>
              {category === 'rent' ? 'تأمين:' : 'مقدم:'} {initialPaymentAmount} 
            </Typography>
            <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
              ج.م
            </Typography>
          </Box>
        </Box>

        {/*Contact Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 'auto', pt: 1, borderTop: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>

              {/*Email Button*/}

              <Button
                  variant="contained"
                  href={emailLink} 
                  target="_blank"
                  sx={{
                      backgroundColor: '#E6F2F9',
                      color: '#007bff',
                      '&:hover': { backgroundColor: '#cce5ff' },
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.8,
                      borderRadius: '8px',
                      textTransform: 'none',
                      minWidth: '100px',
                  }}
              >
                  <EmailIcon sx={{ mr: 0.7, fontSize: '1.2rem', color: '#007bff' }} />
                  الإيميل
              </Button>

              {/* WhatsApp Button */}
              <Button
                  variant="contained"
                  href={whatsappLink} 
                  target="_blank"
                  sx={{
                      backgroundColor: '#E6FAE6',
                      color: '#28a745',
                      '&:hover': { backgroundColor: '#d4edda' },
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.8,
                      borderRadius: '8px',
                      textTransform: 'none',
                      minWidth: '100px',
                  }}
              >
                  <WhatsAppIcon sx={{ mr: 0.7, fontSize: '1.2rem', color: '#28a745' }} />
                  واتساب
              </Button>
            </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;