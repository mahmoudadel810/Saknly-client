import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Home, Search, Plus } from 'lucide-react';
import { Property } from '@/shared/types';
import axios from 'axios';

interface PropertyMapProps {
  properties?: Property[];
  onPropertySelect?: (property: Property) => void;
  selectedProperty?: Property | null;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties = [], 
  onPropertySelect, 
  selectedProperty 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [customPins, setCustomPins] = useState<any[]>([]);
  const [showDirections, setShowDirections] = useState(false);
  const [routeControl, setRouteControl] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Transform properties to map format
  const mapProperties = properties.map((property, index) => {
    // Use real coordinates if available, otherwise use default coordinates with slight variations
    const defaultLat = 30.0444 + (index * 0.01); // Slight variation for each property
    const defaultLng = 31.2357 + (index * 0.01);
    
    return {
      id: property._id,
      title: property.title || 'Property',
      price: property.price ? `${property.price} EGP` : 'Price on request',
      type: property.type || 'Property',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area: property.area ? `${property.area} sqm` : 'N/A',
      lat: property.location?.latitude || property.location?.coordinates?.latitude || defaultLat,
      lng: property.location?.longitude || property.location?.coordinates?.longitude || defaultLng,
      image: property.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop',
      category: property.category || 'sale',
      address: property.location?.address || property.location?.city || 'Egypt'
    };
  });

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

        // Load routing plugin
        const routingLink = document.createElement('link');
        routingLink.rel = 'stylesheet';
        routingLink.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        document.head.appendChild(routingLink);

        const routingScript = document.createElement('script');
        routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
        document.head.appendChild(routingScript);
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
  }, []);

  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    const mapInstance = window.L.map(mapRef.current).setView([30.0444, 31.2357], 11);

    // Add OpenStreetMap tiles (free)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Custom property icon
    const propertyIcon = window.L.divIcon({
      html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></div>`,
      className: 'custom-property-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Add property markers
    if (mapProperties.length > 0) {
      mapProperties.forEach(property => {
        try {
          const marker = window.L.marker([property.lat, property.lng], { icon: propertyIcon })
            .addTo(mapInstance)
            .bindPopup(`
              <div style="width: 250px;">
                <img src="${property.image}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${property.title}</h3>
                <p style="margin: 0 0 4px 0; color: #3b82f6; font-weight: bold; font-size: 14px;">${property.price}</p>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${property.type} • ${property.bedrooms} beds • ${property.bathrooms} baths</p>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${property.area}</p>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 11px;">📍 ${property.address}</p>
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.showDirections('${property.id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Get Directions</button>
                  <button onclick="window.selectProperty('${property.id}')" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">View Details</button>
                </div>
              </div>
            `);
        } catch (error) {
          console.error('Error adding property marker:', error, property);
        }
      });
    } else {
      // Add a message marker when no properties are available
      const messageIcon = window.L.divIcon({
        html: `<div style="background: #f59e0b; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>`,
        className: 'message-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      window.L.marker([30.0444, 31.2357], { icon: messageIcon })
        .addTo(mapInstance)
        .bindPopup(`
          <div style="width: 200px; text-align: center;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">لا توجد عقارات متاحة</h3>
            <p style="margin: 0; color: #666; font-size: 12px;">جاري تحميل العقارات أو لا توجد عقارات في هذه المنطقة</p>
          </div>
        `);
    }

    setMap(mapInstance);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation([userLat, userLng]);

          // Add user location marker
          const userIcon = window.L.divIcon({
            html: `<div style="background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
            className: 'user-location-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          window.L.marker([userLat, userLng], { icon: userIcon })
            .addTo(mapInstance)
            .bindPopup('Your Location');
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }

    // Add click event to add custom pins
    mapInstance.on('click', (e: any) => {
      const customIcon = window.L.divIcon({
        html: `<div style="background: #f59e0b; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
        className: 'custom-pin-icon',
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      const newPin = {
        id: Date.now(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        marker: window.L.marker([e.latlng.lat, e.latlng.lng], { icon: customIcon })
          .addTo(mapInstance)
          .bindPopup(`
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-weight: bold;">Custom Pin</p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">Lat: ${e.latlng.lat.toFixed(6)}<br>Lng: ${e.latlng.lng.toFixed(6)}</p>
              <button onclick="window.removePin(${Date.now()})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove Pin</button>
            </div>
          `)
      };

      setCustomPins(prev => [...prev, newPin]);
    });

    // Global functions for popup buttons
    window.showDirections = (propertyId: string) => {
      const property = mapProperties.find(p => p.id === propertyId);
      if (property && userLocation) {
        showDirectionsTo(property, mapInstance);
      } else {
        alert('Please allow location access to get directions');
      }
    };

    window.selectProperty = (propertyId: string) => {
      const property = mapProperties.find(p => p.id === propertyId);
      if (property) {
        onPropertySelect?.(properties.find(p => p._id === propertyId) as Property);
        mapInstance.setView([property.lat, property.lng], 15);
      }
    };

    window.removePin = (pinId: number) => {
      setCustomPins(prev => {
        const pinToRemove = prev.find(p => p.id === pinId);
        if (pinToRemove) {
          mapInstance.removeLayer(pinToRemove.marker);
        }
        return prev.filter(p => p.id !== pinId);
      });
    };
  };

  const showDirectionsTo = (property: any, mapInstance: any) => {
    if (!userLocation || !window.L.Routing) return;

    // Remove existing route
    if (routeControl) {
      mapInstance.removeControl(routeControl);
    }

    const newRouteControl = window.L.Routing.control({
      waypoints: [
        window.L.latLng(userLocation[0], userLocation[1]),
        window.L.latLng(property.lat, property.lng)
      ],
      routeWhileDragging: true,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 4, opacity: 0.7 }]
      }
    }).addTo(mapInstance);

    setRouteControl(newRouteControl);
    setShowDirections(true);
  };

  const clearDirections = () => {
    if (routeControl && map) {
      map.removeControl(routeControl);
      setRouteControl(null);
      setShowDirections(false);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Egypt')}&limit=1`);
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        map.setView([parseFloat(lat), parseFloat(lon)], 13);
        
        // Add temporary search marker
        const searchIcon = window.L.divIcon({
          html: `<div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></div>`,
          className: 'search-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        window.L.marker([parseFloat(lat), parseFloat(lon)], { icon: searchIcon })
          .addTo(map)
          .bindPopup(`Search Result: ${data[0].display_name}`)
          .openPopup();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              Saknly Property Map
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={clearDirections}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showDirections 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!showDirections}
              >
                <X className="w-4 h-4 mr-1 inline" />
                Clear Route
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search location in Egypt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={searchLocation}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full pt-32" />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Map Instructions
        </h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Click on property markers to view details</li>
          <li>• Click anywhere on map to add custom pins</li>
          <li>• Use "Get Directions" for navigation</li>
          <li>• Search for specific locations in Egypt</li>
        </ul>
      </div>

      {/* Property Details Panel */}
      {selectedProperty && (
        <div className="absolute top-32 right-4 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="relative">
            <img 
              src={selectedProperty.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop'} 
              alt={selectedProperty.title}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => onPropertySelect?.(null as any)}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{selectedProperty.title}</h3>
            <p className="text-blue-600 font-bold text-xl mb-2">{selectedProperty.price} EGP</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {selectedProperty.type}</p>
              <p>Bedrooms: {selectedProperty.bedrooms}</p>
              <p>Bathrooms: {selectedProperty.bathrooms}</p>
              <p>Area: {typeof selectedProperty.area === 'object' ? selectedProperty.area.total : selectedProperty.area} sqm</p>
              <p>📍 {selectedProperty.location?.address || selectedProperty.location?.city || 'Egypt'}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.showDirections(selectedProperty._id)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </button>
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-bold text-sm mb-2">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span>Properties</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span>Custom Pins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Search Result</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap; 