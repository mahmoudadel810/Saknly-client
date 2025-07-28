import React, { useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

declare global {
  interface Window {
    google: any;
  }
}

const Map: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Load map after script is ready
      fetchLocation(30.5970, 30.9876, 'محافظة المنوفية');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const fetchLocation = (lat: number, lng: number, title: string) => {
    if (!window.google) return;

    const myLatLng = { lat, lng };
    const map = new window.google.maps.Map(document.getElementById("map") as HTMLElement, {
      zoom: 10,
      center: myLatLng,
    });

    new window.google.maps.Marker({
      position: myLatLng,
      map,
      title,
    });
  };

  const handleCountryChange = (event: any) => {
    const country = event.target.value as string;

    if (country === 'Egypt') {
      fetchLocation(26.8206, 30.8025, 'مصر');
    } else if (country === 'Menoufia') {
      fetchLocation(30.5970, 30.9876, 'محافظة المنوفية');
    }
  };

  return (
    <Box sx={{ width: '100%', height: '400px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl sx={{ width: 300, mx: 'auto' }}>
        <InputLabel id="country-select-label">اختر المنطقة</InputLabel>
        <Select
          labelId="country-select-label"
          id="countrySelect"
          defaultValue="Menoufia"
          onChange={handleCountryChange}
          label="اختر المنطقة"
          sx={{ backgroundColor: '#fff' }}
        >
          <MenuItem value="Egypt">مصر</MenuItem>
          <MenuItem value="Menoufia">محافظة المنوفية</MenuItem>
        </Select>
      </FormControl>

      <Box id="map" sx={{ width: '100%', height: '100%', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }} />
    </Box>
  );
};

export default Map;
