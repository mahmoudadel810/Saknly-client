"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Button,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSidebarProps { }

const FilterSidebar: React.FC<FilterSidebarProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters, initialized from URL search params
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get('price[gte]')) || 500000,
    Number(searchParams.get('price[lte]')) || 20000000
  ]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(searchParams.get('location.city')?.split(',') || []);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(searchParams.get('type')?.split(',') || []);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(
    searchParams.has('bedrooms') ? Number(searchParams.get('bedrooms')) : null
  );
  const [selectedBathrooms, setSelectedBathrooms] = useState<number | null>(
    searchParams.has('bathrooms') ? Number(searchParams.get('bathrooms')) : null
  );
  const [unitArea, setUnitArea] = useState<number | null>(
    searchParams.has('area') ? Number(searchParams.get('area')) : null
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(searchParams.get('amenities')?.split(',') || []);
  const [downPayment, setDownPayment] = useState<string>(searchParams.get('downPayment') || '');
  const [installmentPeriodInYears, setInstallmentPeriodInYears] = useState<number | null>(
    searchParams.has('installmentPeriodInYears') ? Number(searchParams.get('installmentPeriodInYears')) : null
  );

  // Constants for filter options
  const PROPERTY_TYPES_OPTIONS = [
    { value: 'شقة', label: 'شقة' },
    { value: 'فيلا', label: 'فيلا' },
    { value: 'محل', label: 'محل' },
    { value: 'استوديو', label: 'استوديو' },
    { value: 'دوبلكس', label: 'دوبلكس' },
  ];

  const CITIES_OPTIONS = [
    'شبين الكوم', 'منوف', 'تلا', 'أشمون', 'قويسنا', 
    'بركة السبع', 'الباجور', 'السادات', 'الشهداء', 'سرس الليان',
    'منشأة سلطان'
  ];

  const AMENITIES_OPTIONS = [
    'تكييف', 'مصعد', 'شرفة', 'موقف سيارات', 'مسموح بالحيوانات الأليفة', 'مفروشة جزئياً', 'أمن', 'نظام كهرباء ذكي', 'مطبخ مجهز', 'مخزن'
  ];

  const bedroomOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const bathroomOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const installmentYearsOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const updateURL = useCallback((newFilters: URLSearchParams) => {
    router.push(`?${newFilters.toString()}`);
  }, [router]);

  useEffect(() => {
    const newFilters = new URLSearchParams();

    if (searchQuery) {
      newFilters.set('search', searchQuery);
    }
    if (priceRange[0] !== 500000) {
      newFilters.set('price[gte]', priceRange[0].toString());
    }
    if (priceRange[1] !== 20000000) {
      newFilters.set('price[lte]', priceRange[1].toString());
    }
    if (selectedAreas.length > 0) {
      newFilters.set('location.city', selectedAreas.join(','));
    }
    if (selectedPropertyTypes.length > 0) {
      newFilters.set('type', selectedPropertyTypes.join(','));
    }
    if (selectedBedrooms !== null) {
      newFilters.set('bedrooms', selectedBedrooms.toString());
    }
    if (selectedBathrooms !== null) {
      newFilters.set('bathrooms', selectedBathrooms.toString());
    }
    if (unitArea !== null) {
      newFilters.set('area', unitArea.toString());
    }
    if (selectedAmenities.length > 0) {
      newFilters.set('amenities', selectedAmenities.join(','));
    }
    if (downPayment) {
      newFilters.set('downPayment', downPayment);
    }
    if (installmentPeriodInYears !== null) {
      newFilters.set('installmentPeriodInYears', installmentPeriodInYears.toString());
    }

    updateURL(newFilters);
  }, [
    searchQuery,
    priceRange,
    selectedAreas,
    selectedPropertyTypes,
    selectedBedrooms,
    selectedBathrooms,
    unitArea,
    selectedAmenities,
    downPayment,
    installmentPeriodInYears,
    updateURL
  ]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setPriceRange([value, priceRange[1]]);
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setPriceRange([priceRange[0], value]);
  };

  const handleAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedAreas(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handlePropertyTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedPropertyTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleBedroomChange = (beds: number) => {
    setSelectedBedrooms(prev => (prev === beds ? null : beds));
  };

  const handleBathroomChange = (baths: number) => {
    setSelectedBathrooms(prev => (prev === baths ? null : baths));
  };

  const handleUnitAreaInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setUnitArea(isNaN(value) ? null : value);
  };

  const handleAmenityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedAmenities(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleDownPaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDownPayment(event.target.value);
  };

  const handleInstallmentPeriodInYearsChange = (years: number) => {
    setInstallmentPeriodInYears(prev => (prev === years ? null : years));
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setPriceRange([500000, 20000000]);
    setSelectedAreas([]);
    setSelectedPropertyTypes([]);
    setSelectedBedrooms(null);
    setSelectedBathrooms(null);
    setUnitArea(null);
    setSelectedAmenities([]);
    setDownPayment('');
    setInstallmentPeriodInYears(null);

    router.push('');
  };

  const handleClearFilter = (filterName: string) => {
    const newFilters = new URLSearchParams(searchParams.toString());
    switch (filterName) {
      case 'search':
        setSearchQuery('');
        newFilters.delete('search');
        break;
      case 'price':
        setPriceRange([500000, 20000000]);
        newFilters.delete('price[gte]');
        newFilters.delete('price[lte]');
        break;
      case 'location.city':
        setSelectedAreas([]);
        newFilters.delete('location.city');
        break;
      case 'type':
        setSelectedPropertyTypes([]);
        newFilters.delete('type');
        break;
      case 'bedrooms':
        setSelectedBedrooms(null);
        newFilters.delete('bedrooms');
        break;
      case 'bathrooms':
        setSelectedBathrooms(null);
        newFilters.delete('bathrooms');
        break;
      case 'area':
        setUnitArea(null);
        newFilters.delete('area');
        break;
      case 'amenities':
        setSelectedAmenities([]);
        newFilters.delete('amenities');
        break;
      case 'downPayment':
        setDownPayment('');
        newFilters.delete('downPayment');
        break;
      case 'installmentPeriodInYears':
        setInstallmentPeriodInYears(null);
        newFilters.delete('installmentPeriodInYears');
        break;
      default:
        break;
    }
    updateURL(newFilters);
  };

  return (
    <Box
      sx={{
        width: { xs: '50%', md: 350 }, // Full width on small screens, 350px on medium and up
        p: { xs: 2, md: 3 }, // Less padding on small screens
        borderLeft: { xs: 'none', md: '1px solid #e0e0e0' }, // No left border on small screens
        borderBottom: { xs: '1px solid #e0e0e0', md: 'none' }, // Add bottom border on small screens if it's placed at the top
        direction: 'rtl',
        backgroundColor: '#fff',
        flexShrink: 0,
        overflowY: 'auto',
        maxHeight: { xs: 'auto', md: '100vh' }, // Adjust max height for small screens if needed
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          الفلاتر
        </Typography>
        <Button onClick={handleClearAll} sx={{ color: 'primary.main', textDecoration: 'underline' }}>
          مسح الكل
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="البحث بالمدينة, العنوان ..."
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3, '.MuiOutlinedInput-root': { borderRadius: '8px' } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ ml: 1 }} />
            </InputAdornment>
          ),
          style: { direction: 'rtl', textAlign: 'right' }
        }}
        inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
      />
      <Divider sx={{ my: 3 }} />

      {/* Price Range Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            السعر
          </FormLabel>
          <Button onClick={() => handleClearFilter('price')} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={500000}
          max={20000000}
          sx={{ direction: 'ltr', width: '95%', margin: '0 auto' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap', gap: 1 }}> {/* Added flexWrap and gap here */}
          <TextField
            label="الحد الأدنى"
            variant="outlined"
            size="small"
            type="number"
            value={priceRange[0]}
            onChange={handleMinPriceChange}
            sx={{ flexGrow: 1, '.MuiOutlinedInput-root': { borderRadius: '8px' } }} 
            inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
          />
          <TextField
            label="الحد الأقصى"
            variant="outlined"
            size="small"
            type="number"
            value={priceRange[1]}
            onChange={handleMaxPriceChange}
            sx={{ flexGrow: 1, '.MuiOutlinedInput-root': { borderRadius: '8px' } }} 
            inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
          />
        </Box>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Areas (Cities) Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            المناطق (المدن)
          </FormLabel>
          <Button onClick={() => handleClearFilter('location.city')} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <FormGroup>
          {CITIES_OPTIONS.map((city) => (
            <FormControlLabel
              key={city}
              control={
                <Checkbox
                  checked={selectedAreas.includes(city)}
                  onChange={handleAreaChange}
                  name={city}
                />
              }
              label={city}
              sx={{ '.MuiFormControlLabel-label': { mr: 1 } }}
            />
          ))}
        </FormGroup>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Property Type Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            نوع العقار
          </FormLabel>
          <Button onClick={() => handleClearFilter('type')} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <FormGroup>
          {PROPERTY_TYPES_OPTIONS.map((type) => (
            <FormControlLabel
              key={type.value}
              control={
                <Checkbox
                  checked={selectedPropertyTypes.includes(type.value)}
                  onChange={handlePropertyTypeChange}
                  name={type.value}
                />
              }
              label={type.label}
              sx={{ '.MuiFormControlLabel-label': { mr: 1 } }}
            />
          ))}
        </FormGroup>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Bedrooms Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            عدد غرف النوم
          </FormLabel>
          <Button onClick={() => handleClearFilter('bedrooms')} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {bedroomOptions.map((beds) => (
            <Button
              key={beds}
              variant={selectedBedrooms === beds ? 'contained' : 'outlined'}
              onClick={() => handleBedroomChange(beds)}
              sx={{ minWidth: '40px', padding: '5px 8px' }}
            >
              {beds}
            </Button>
          ))}
        </Box>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Bathrooms Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            عدد الحمامات
          </FormLabel>
          <Button onClick={() => handleClearFilter('bathrooms')} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {bathroomOptions.map((baths) => (
            <Button
              key={baths}
              variant={selectedBathrooms === baths ? 'contained' : 'outlined'}
              onClick={() => handleBathroomChange(baths)}
              sx={{ minWidth: '40px', padding: '5px 8px' }}
            >
              {baths}
            </Button>
          ))}
        </Box>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Unit Area Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            مساحة الوحدة (متر مربع)
          </FormLabel>
          <Button onClick={() => handleClearFilter('area')} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <TextField
          fullWidth
          label="المساحة"
          variant="outlined"
          size="small"
          type="number"
          value={unitArea === null ? '' : unitArea}
          onChange={handleUnitAreaInputChange}
          inputProps={{ min: 0, style: { textAlign: 'right' } }}
          sx={{ '.MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Amenities Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            الرفاهيات
          </FormLabel>
          <Button onClick={() => handleClearFilter('amenities')} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <FormGroup>
          {AMENITIES_OPTIONS.map((amenity) => (
            <FormControlLabel
              key={amenity}
              control={
                <Checkbox
                  checked={selectedAmenities.includes(amenity)}
                  onChange={handleAmenityChange}
                  name={amenity}
                />
              }
              label={amenity}
              sx={{ '.MuiFormControlLabel-label': { mr: 1 } }}
            />
          ))}
        </FormGroup>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Payment Plan Filter */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
            خطة الدفع
          </FormLabel>
          <Button onClick={() => { handleClearFilter('downPayment'); handleClearFilter('installmentPeriodInYears'); }} sx={{ color: 'primary.main', textDecoration: 'underline', fontSize: '0.8rem' }}>
            الغاء
          </Button>
        </Box>
        <TextField
          fullWidth
          label="المقدم (Down Payment)"
          variant="outlined"
          size="small"
          type="number"
          value={downPayment}
          onChange={handleDownPaymentChange}
          inputProps={{ min: 0, style: { textAlign: 'right' } }}
          sx={{ mb: 2, '.MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
        <FormLabel component="legend" sx={{ textAlign: 'right', fontWeight: 'bold', mb: 1 }}>
          عدد سنوات التقسيط
        </FormLabel>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {installmentYearsOptions.map((years) => (
            <Button
              key={years}
              variant={installmentPeriodInYears === years ? 'contained' : 'outlined'}
              onClick={() => handleInstallmentPeriodInYearsChange(years)}
              sx={{ minWidth: '40px', padding: '5px 8px' }}
            >
              {years}
            </Button>
          ))}
        </Box>
      </FormControl>
    </Box>
  );
};

export default FilterSidebar;