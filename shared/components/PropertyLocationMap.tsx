import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { Navigation, ExternalLink } from 'lucide-react';

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({ 
  latitude, 
  longitude, 
  title, 
  address 
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeControl, setRouteControl] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

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
        initializeMap();
      }
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [latitude, longitude]);

  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    const mapInstance = window.L.map(mapRef.current).setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Custom property marker icon
    const propertyIcon = window.L.divIcon({
      html: `<div style="background: #ef4444; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></div>`,
      className: 'property-location-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    // Add property marker
    window.L.marker([latitude, longitude], { icon: propertyIcon })
      .addTo(mapInstance)
      .bindPopup(`
        <div style="width: 250px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">${title}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">📍 ${address}</p>
        </div>
      `)
      .openPopup();

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation([userLat, userLng]);

          // Add user location marker
          const userIcon = window.L.divIcon({
            html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
            className: 'user-location-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          window.L.marker([userLat, userLng], { icon: userIcon })
            .addTo(mapInstance)
            .bindPopup('موقعك الحالي');
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }

    setMap(mapInstance);
  };

  const showDirections = () => {
    if (!userLocation || !map) return;

    // Remove existing route
    if (routeControl) {
      map.removeControl(routeControl);
    }

    // Load routing plugin if not already loaded
    if (!window.L.Routing) {
      const routingScript = document.createElement('script');
      routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
      routingScript.onload = () => {
        const routingLink = document.createElement('link');
        routingLink.rel = 'stylesheet';
        routingLink.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        document.head.appendChild(routingLink);
        
        createRoute();
      };
      document.head.appendChild(routingScript);
    } else {
      createRoute();
    }
  };

  const createRoute = () => {
    if (!window.L.Routing || !map || !userLocation) return;

    const newRouteControl = window.L.Routing.control({
      waypoints: [
        window.L.latLng(userLocation[0], userLocation[1]),
        window.L.latLng(latitude, longitude)
      ],
      routeWhileDragging: true,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 4, opacity: 0.7 }]
      }
    }).addTo(map);

    // Listen for route calculation
    newRouteControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        setRouteInfo({
          distance: (route.summary.totalDistance / 1000).toFixed(1) + ' كم',
          duration: Math.round(route.summary.totalTime / 60) + ' دقيقة'
        });
      }
    });

    setRouteControl(newRouteControl);
  };

  const clearDirections = () => {
    if (routeControl && map) {
      map.removeControl(routeControl);
      setRouteControl(null);
      setRouteInfo(null);
    }
  };

  const openInExternalMap = () => {
    // Try to open in Google Maps first
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Map Controls */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1000,
        display: 'flex',
        gap: 1
      }}>
        {/* External Map Button */}
        <Tooltip title="افتح في Google Maps">
          <Button
            variant="contained"
            size="small"
            onClick={openInExternalMap}
            startIcon={<ExternalLink />}
            sx={{ 
              bgcolor: 'white', 
              color: '#333',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            Google Maps
          </Button>
        </Tooltip>

        {/* Directions Button */}
        {userLocation && (
          <>
            {!routeControl ? (
              <Button
                variant="contained"
                size="small"
                onClick={showDirections}
                startIcon={<Navigation />}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#3b82f6',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                احصل على الاتجاهات
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={clearDirections}
                sx={{ 
                  bgcolor: '#ef4444', 
                  color: 'white',
                  '&:hover': { bgcolor: '#dc2626' }
                }}
              >
                إخفاء الاتجاهات
              </Button>
            )}
          </>
        )}
      </Box>

      {/* Route Info */}
      {routeInfo && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 10, 
          left: 10, 
          zIndex: 1000,
          bgcolor: 'white',
          borderRadius: 2,
          p: 2,
          boxShadow: 2,
          minWidth: 200
        }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            معلومات الرحلة
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              المسافة: {routeInfo.distance}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              الوقت: {routeInfo.duration}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PropertyLocationMap; 