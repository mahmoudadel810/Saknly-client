"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Chip,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  LocationOn,
  ZoomIn,
  ZoomOut,
  MyLocation,
  FilterList,
  Close,
  Directions,
  Phone,
  WhatsApp
} from '@mui/icons-material';
import { Property } from '@/shared/types';

interface InteractiveMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  selectedProperty?: Property | null;
}

// Mock map coordinates for demonstration
const mockMapData = {
  center: { lat: 30.4668, lng: 31.1856 }, // شبين الكوم
  zoom: 12,
  properties: [
    {
      id: '1',
      position: { lat: 30.4668, lng: 31.1856 },
      title: 'شقة فاخرة في قلب المدينة',
      price: '2,500,000',
      type: 'شقة',
      status: 'للبيع'
    },
    {
      id: '2',
      position: { lat: 30.4568, lng: 31.1756 },
      title: 'فيلا عائلية في حي هادئ',
      price: '5,000,000',
      type: 'فيلا',
      status: 'للبيع'
    },
    {
      id: '3',
      position: { lat: 30.4768, lng: 31.1956 },
      title: 'شقة للإيجار في منطقة مميزة',
      price: '5,000',
      type: 'شقة',
      status: 'للإيجار'
    }
  ]
};

export default function InteractiveMap({ properties, onPropertySelect, selectedProperty }: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState(mockMapData.center);
  const [zoom, setZoom] = useState(mockMapData.zoom);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<any>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 8));
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handlePropertyClick = (property: any) => {
    setHoveredProperty(property);
    setShowPropertyDetails(true);
    onPropertySelect?.(property as Property);
  };

  return (
    <Box sx={{ position: 'relative', height: '600px', borderRadius: 3, overflow: 'hidden' }}>
      {/* Map Container */}
      <Paper 
        elevation={0}
        sx={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        {/* Map Controls */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <IconButton
            onClick={handleZoomIn}
            sx={{ 
              bgcolor: 'white', 
              boxShadow: 2,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ZoomIn />
          </IconButton>
          <IconButton
            onClick={handleZoomOut}
            sx={{ 
              bgcolor: 'white', 
              boxShadow: 2,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ZoomOut />
          </IconButton>
          <IconButton
            onClick={handleMyLocation}
            sx={{ 
              bgcolor: 'white', 
              boxShadow: 2,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <MyLocation />
          </IconButton>
        </Box>

        {/* Map Info */}
        <Box sx={{ textAlign: 'center', color: '#0284c7' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            خريطة العقارات
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            تم العثور على {properties.length} عقار في هذه المنطقة
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, mt: 1, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            إحداثيات: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)} | التكبير: {zoom}x
          </Typography>
        </Box>

        {/* Property Markers */}
        <Box sx={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none'
        }}>
          {mockMapData.properties.map((property, index) => (
            <Box
              key={property.id}
              sx={{
                position: 'absolute',
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index * 10)}%`,
                pointerEvents: 'auto',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.1)',
                  zIndex: 1000
                }
              }}
              onClick={() => handlePropertyClick(property)}
              onMouseEnter={() => setHoveredProperty(property)}
              onMouseLeave={() => setHoveredProperty(null)}
            >
              <Box sx={{ 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Marker */}
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: property.status === 'للبيع' ? '#0284c7' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '3px solid white'
                }}>
                  {property.type === 'شقة' ? 'ش' : property.type === 'فيلا' ? 'ف' : 'ع'}
                </Box>
                
                {/* Price Label */}
                <Paper sx={{
                  mt: 1,
                  px: 2,
                  py: 0.5,
                  background: 'white',
                  boxShadow: 2,
                  borderRadius: 2,
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {property.price}
                </Paper>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Property Details Popup */}
        {hoveredProperty && (
          <Box sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 1000
          }}>
            <Card sx={{ 
              background: 'white',
              boxShadow: 4,
              borderRadius: 3,
              maxWidth: 400,
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: hoveredProperty.status === 'للبيع' ? '#0284c7' : '#10b981',
                    width: 40,
                    height: 40
                  }}>
                    {hoveredProperty.type === 'شقة' ? 'ش' : hoveredProperty.type === 'فيلا' ? 'ف' : 'ع'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {hoveredProperty.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {hoveredProperty.type} • {hoveredProperty.status}
                    </Typography>
                  </Box>
                  <Chip 
                    label={hoveredProperty.price}
                    color={hoveredProperty.status === 'للبيع' ? 'primary' : 'success'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Directions />}
                    sx={{ flex: 1 }}
                  >
                    الاتجاهات
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Phone />}
                    sx={{ flex: 1 }}
                  >
                    اتصل
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<WhatsApp />}
                    sx={{ flex: 1 }}
                  >
                    واتساب
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>

      {/* Property Details Dialog */}
      <Dialog
        open={showPropertyDetails}
        onClose={() => setShowPropertyDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontWeight: 700
        }}>
          تفاصيل العقار
          <IconButton onClick={() => setShowPropertyDetails(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {hoveredProperty && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: hoveredProperty.status === 'للبيع' ? '#0284c7' : '#10b981',
                  width: 60,
                  height: 60
                }}>
                  {hoveredProperty.type === 'شقة' ? 'ش' : hoveredProperty.type === 'فيلا' ? 'ف' : 'ع'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {hoveredProperty.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                    {hoveredProperty.type} • {hoveredProperty.status}
                  </Typography>
                  <Chip 
                    label={hoveredProperty.price}
                    color={hoveredProperty.status === 'للبيع' ? 'primary' : 'success'}
                    sx={{ fontWeight: 700, fontSize: '16px' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                الموقع
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn color="primary" />
                <Typography>
                  شبين الكوم، المنوفية، مصر
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                الخصائص
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip label="3 غرف" variant="outlined" />
                <Chip label="2 حمام" variant="outlined" />
                <Chip label="120 م²" variant="outlined" />
                <Chip label="الطابق 3" variant="outlined" />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                المرافق
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                <Chip label="تكييف" size="small" />
                <Chip label="مصعد" size="small" />
                <Chip label="موقف سيارات" size="small" />
                <Chip label="أمن 24/7" size="small" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowPropertyDetails(false)}
          >
            إغلاق
          </Button>
          <Button 
            variant="contained"
            sx={{ background: '#0284c7' }}
          >
            عرض التفاصيل الكاملة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 