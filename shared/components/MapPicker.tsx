import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, TextField, Alert } from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import NavigationOutlined from '@mui/icons-material/NavigationOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose?: () => void;
  selectedCity?: string;
}

const LOCATIONIQ_API_KEY = "pk.d8d051bc7be4dacd5916e32712deaa39";

const MapPicker: React.FC<MapPickerProps> = ({ 
  latitude = 30.5546, 
  longitude = 31.0117, 
  onLocationSelect, 
  onClose 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedLat, setSelectedLat] = useState<number>(latitude);
  const [selectedLng, setSelectedLng] = useState<number>(longitude);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [marker, setMarker] = useState<any>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');
  const [searchError, setSearchError] = useState<string>("");

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        // Add a small delay to ensure the container is ready
        setTimeout(() => {
          initializeMap();
        }, 100);
      }
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Re-initialize map when coordinates change
  useEffect(() => {
    if (window.L && mapRef.current && map) {
      map.setView([selectedLat, selectedLng], map.getZoom());
      map.invalidateSize();
    }
  }, [selectedLat, selectedLng]);

  // Force map resize when component mounts
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [map]);

  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    // Remove existing map if it exists
    if (map) {
      map.remove();
    }

    const mapInstance = window.L.map(mapRef.current).setView([latitude, longitude], 13);

    // Force map to resize after initialization
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 200);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Custom marker icon - تحسين شكل الـ pin
    const markerIcon = window.L.divIcon({
      html: `<div style="
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border-radius: 50% 50% 50% 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        position: relative;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 18px;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        ">📍</div>
      </div>`,
      className: 'custom-location-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    // User location marker icon
    const userLocationIcon = window.L.divIcon({
      html: `<div style="
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      ">
        <div style="
          font-size: 14px;
          font-weight: bold;
        ">📍</div>
      </div>`,
      className: 'user-location-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    // Add initial marker
    const initialMarker = window.L.marker([latitude, longitude], { 
      icon: markerIcon, 
      draggable: true,
      zIndexOffset: 1000
    })
      .addTo(mapInstance)
      .bindPopup(`
        <div style="
          text-align: center; 
          padding: 12px; 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 8px;
          border: 2px solid #ef4444;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 200px;
        ">
          <div style="
            font-weight: bold; 
            color: #ef4444; 
            margin-bottom: 8px;
            font-size: 16px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          ">📍 موقع العقار</div>
          <div style="
            font-size: 12px; 
            color: #64748b;
            background: rgba(239, 68, 68, 0.1);
            padding: 6px 8px;
            border-radius: 4px;
            border-left: 3px solid #ef4444;
          ">اسحب لتغيير الموقع</div>
        </div>
      `);

    setMarker(initialMarker);

    // Handle marker drag
    initialMarker.on('dragend', (e: any) => {
      const lat = e.target.getLatLng().lat;
      const lng = e.target.getLatLng().lng;
      setSelectedLat(lat);
      setSelectedLng(lng);
      onLocationSelect(lat, lng);
    });

    // Handle map click - حذف الـ pin القديم وإضافة واحد جديد
    mapInstance.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Remove existing marker - حذف الـ pin القديم
      if (marker) {
        mapInstance.removeLayer(marker);
      }

      // Add new marker - إضافة الـ pin الجديد
      const newMarker = window.L.marker([lat, lng], { 
        icon: markerIcon, 
        draggable: true,
        zIndexOffset: 1000
      })
        .addTo(mapInstance)
        .bindPopup(`
          <div style="
            text-align: center; 
            padding: 12px; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 8px;
            border: 2px solid #ef4444;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 200px;
          ">
            <div style="
              font-weight: bold; 
              color: #ef4444; 
              margin-bottom: 8px;
              font-size: 16px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            ">📍 موقع العقار</div>
            <div style="
              font-size: 12px; 
              color: #64748b;
              background: rgba(239, 68, 68, 0.1);
              padding: 6px 8px;
              border-radius: 4px;
              border-left: 3px solid #ef4444;
            ">اسحب لتغيير الموقع</div>
          </div>
        `);

      setMarker(newMarker);
      setSelectedLat(lat);
      setSelectedLng(lng);
      onLocationSelect(lat, lng);

      // Handle marker drag
      newMarker.on('dragend', (dragEvent: any) => {
        const dragLat = dragEvent.target.getLatLng().lat;
        const dragLng = dragEvent.target.getLatLng().lng;
        setSelectedLat(dragLat);
        setSelectedLng(dragLng);
        onLocationSelect(dragLat, dragLng);
      });
    });

    setMap(mapInstance);
  };

  const showMyLocation = () => {
    if (!map || !navigator.geolocation) {
      setLocationError('متصفحك لا يدعم تحديد الموقع. يرجى استخدام متصفح حديث.');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Remove existing user location marker
        if (userLocationMarker) {
          map.removeLayer(userLocationMarker);
        }

        // Create user location marker
        const userLocationIcon = window.L.divIcon({
          html: `<div style="
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
          ">
            <div style="
              font-size: 14px;
              font-weight: bold;
            ">📍</div>
          </div>`,
          className: 'user-location-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        });

        const newUserMarker = window.L.marker([latitude, longitude], {
          icon: userLocationIcon,
          zIndexOffset: 999
        })
          .addTo(map)
          .bindPopup(`
            <div style="
              text-align: center; 
              padding: 12px; 
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border-radius: 8px;
              border: 2px solid #3b82f6;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              min-width: 200px;
            ">
              <div style="
                font-weight: bold; 
                color: #3b82f6; 
                margin-bottom: 8px;
                font-size: 16px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
              ">📍 موقعك الحالي</div>
              <div style="
                font-size: 12px; 
                color: #64748b;
                background: rgba(59, 130, 246, 0.1);
                padding: 6px 8px;
                border-radius: 4px;
                border-left: 3px solid #3b82f6;
              ">انقر على الخريطة لتحديد موقع العقار</div>
            </div>
          `);

        setUserLocationMarker(newUserMarker);
        
        // Center map on user location
        map.setView([latitude, longitude], 15);
        
        setIsLoadingLocation(false);
        setLocationError('');
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
        
        // معالجة أنواع مختلفة من الأخطاء
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('تم رفض طلب تحديد الموقع. يرجى السماح للموقع بالوصول إلى موقعك في إعدادات المتصفح.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('معلومات الموقع غير متاحة حالياً. يرجى المحاولة مرة أخرى.');
            break;
          case error.TIMEOUT:
            setLocationError('انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى.');
            break;
          default:
            setLocationError('حدث خطأ في تحديد موقعك. يرجى المحاولة مرة أخرى أو تحديد الموقع يدوياً.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // زيادة المهلة إلى 15 ثانية
        maximumAge: 60000
      }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    // استخدم نص البحث كما هو من المستخدم
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(searchQuery)}&format=json&limit=5`
    );
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      const newLat = parseFloat(lat);
      const newLng = parseFloat(lon);
      setSelectedLat(newLat);
      setSelectedLng(newLng);
      if (map) map.setView([newLat, newLng], 16);
      // Remove existing marker
      if (marker) {
        map.removeLayer(marker);
      }
      // Add new marker
      const markerIcon = window.L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border-radius: 50% 50% 50% 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
          position: relative;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: 18px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          ">📍</div>
        </div>`,
        className: 'custom-location-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
      const newMarker = window.L.marker([newLat, newLng], {
        icon: markerIcon,
        draggable: true,
        zIndexOffset: 1000
      })
        .addTo(map)
        .bindPopup(`
          <div style="
            text-align: center; 
            padding: 12px; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 8px;
            border: 2px solid #ef4444;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 200px;
          ">
            <div style="
              font-weight: bold; 
              color: #ef4444; 
              margin-bottom: 8px;
              font-size: 16px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            ">📍 موقع العقار</div>
            <div style="
              font-size: 12px; 
              color: #64748b;
              background: rgba(239, 68, 68, 0.1);
              padding: 6px 8px;
              border-radius: 4px;
              border-left: 3px solid #ef4444;
            ">اسحب لتغيير الموقع</div>
          </div>
        `);
      setMarker(newMarker);
      // دعم السحب
      newMarker.on('dragend', (dragEvent: any) => {
        const dragLat = dragEvent.target.getLatLng().lat;
        const dragLng = dragEvent.target.getLatLng().lng;
        setSelectedLat(dragLat);
        setSelectedLng(dragLng);
        onLocationSelect(dragLat, dragLng);
      });
      onLocationSelect(newLat, newLng);
      setSearchError(""); // امسح الخطأ عند وجود نتائج
    } else {
      setSearchError("لم يتم العثور على نتائج لهذا البحث.");
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
      {/* Custom CSS for better marker appearance */}
      <style jsx>{`
        .custom-location-marker {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1) rotate(-45deg);
          }
          50% {
            transform: scale(1.1) rotate(-45deg);
          }
          100% {
            transform: scale(1) rotate(-45deg);
          }
        }
        
        .custom-location-marker:hover {
          animation: none;
          transform: scale(1.2) rotate(-45deg) !important;
          transition: transform 0.3s ease;
        }

        .user-location-marker {
          animation: pulse 2s infinite;
        }
      `}</style>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PlaceOutlined sx={{ fontSize: 20 }} />
          اختر موقع العقار
        </Typography>
        {onClose && (
          <Button onClick={onClose} size="small">
            <CloseOutlined sx={{ fontSize: 16 }} />
          </Button>
        )}
      </Box>

      {/* Search Bar and Location Button */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="ابحث عن موقع في مصر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          InputProps={{
            startAdornment: <SearchOutlined sx={{ fontSize: 16 }} className="text-gray-400 ml-2" />
          }}
        />
        <Button
          variant="contained"
          onClick={searchLocation}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          بحث
        </Button>
        <Button
          variant="outlined"
          onClick={showMyLocation}
          disabled={isLoadingLocation}
          sx={{ 
            minWidth: 'auto', 
            px: 2,
            borderColor: '#3b82f6',
            color: '#3b82f6',
            '&:hover': {
              borderColor: '#1d4ed8',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }
          }}
          startIcon={<NavigationOutlined sx={{ fontSize: 16 }} />}
        >
          {isLoadingLocation ? 'جاري...' : 'موقعي'}
        </Button>
      </Box>

      {/* Location Error Message */}
      {locationError && (
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: 2,
          color: '#dc2626',
          position: 'relative'
        }}>
          <Button
            onClick={() => setLocationError('')}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              minWidth: 'auto',
              p: 0.5,
              color: '#dc2626'
            }}
          >
            <CloseOutlined sx={{ fontSize: 16 }} />
          </Button>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 4 }}>
            <NavigationOutlined sx={{ fontSize: 16 }} />
            {locationError}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#7f1d1d' }}>
            💡 يمكنك تحديد الموقع يدوياً بالنقر على الخريطة أو استخدام البحث
          </Typography>
        </Box>
      )}

      {/* Search Error Message */}
      {searchError && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {searchError}
        </Alert>
      )}

      {/* Map */}
      <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0', minHeight: '500px', position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      </Box>

      {/* Coordinates Display */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          الإحداثيات المحددة:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="خط العرض (Latitude)"
            value={selectedLat.toFixed(6)}
            size="small"
            InputProps={{ readOnly: true }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="خط الطول (Longitude)"
            value={selectedLng.toFixed(6)}
            size="small"
            InputProps={{ readOnly: true }}
            sx={{ minWidth: 200 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 انقر على الخريطة لتحديد الموقع أو اسحب العلامة لتغييرها
        </Typography>
      </Box>
    </Box>
  );
};

export default MapPicker; 