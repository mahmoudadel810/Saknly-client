"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImportProperties from '../../../shared/components/ImportProperties';
import { useToast } from '../../../shared/provider/ToastProvider';
import { CITY_OPTIONS, normalizeCity } from '../../../shared/constants/property';
import { API_URL, authHeader } from '../../../shared/utils/auth';

const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  secondary: {
    800: "#1e293b",
    700: "#334155",
    500: "#64748b",
    300: "#cbd5e1",
  },
  danger: {
    500: "#ef4444",
    600: "#dc2626",
  },
};

const initialFormData = {
  operationType: 'sale',
  type: 'شقة',
  ownershipType: 'firstOwner',
  area: '',
  bedrooms: '3',
  bathrooms: '2',
  amenities: [] as string[],
  title: '',
  description: '',
  location: '',
  district: '',
  latitude: 30.0444,
  longitude: 31.2357,
  price: '',
  contactInfo: { name: '', phone: '', email: '', whatsapp: '' },
  isNegotiable: false,
  floor: '',
  totalFloors: '',
  images: [] as File[],
  deliveryDate: '',
  deliveryTerms: '',
  propertyStatus: 'ready',
  paymentMethod: 'cash',
  downPayment: '',
  installmentPeriodInYears: '',
  minInstallmentAmount: '',
  deposit: '',
  leaseDuration: '',
  availableFrom: '',
  utilitiesIncluded: false,
  utilitiesCost: '',
  utilitiesDetails: '',
  rulesPets: false,
  rulesParties: false,
  rulesOther: '',
  isStudentFriendly: false,
  studentRoomType: '',
  studentsPerRoom: '',
  studentGenderPolicy: '',
  academicYearOnly: false,
  semester: '',
  nearbyUniversities: [{ name: '', distanceInKm: '' }],
};

export default function AdminImportPropertiesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importQueue, setImportQueue] = useState<any[]>([]);
  const [currentImportIndex, setCurrentImportIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0, total: 0 });

  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        router.push('/login');
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        if (decoded.role !== 'admin') {
          showToast('غير مصرح لك بالوصول إلى هذه الصفحة', 'error');
          router.push('/');
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        showToast('خطأ في التحقق من الصلاحيات', 'error');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router, showToast]);

  // Import handling functions
  const handleImportedProperties = (importedProperties: any[]) => {
    const convertedProperties = importedProperties.map(prop => {
      const extractNumbers = (str: string) => {
        const match = str.match(/\d+/g);
        return match ? match.join('') : '';
      };

      const parsePrice = (priceText: string) => {
        if (priceText.includes('مليون')) {
          const parts = priceText.split('مليون');
          const million = parseInt(parts[0]) * 1000000;
          const rest = parts[1] ? parseInt(extractNumbers(parts[1]) || '0') : 0;
          return million + rest;
        }
        if (priceText.includes('الف')) {
          const thousands = parseInt(extractNumbers(priceText)) * 1000;
          return thousands;
        }
        return parseInt(extractNumbers(priceText)) || '';
      };

      const parseArea = (areaText: string) => {
        return extractNumbers(areaText) || '';
      };

      const parseFloor = (floorText: string) => {
        return extractNumbers(floorText) || '1';
      };

      return {
        ...initialFormData,
        location: prop.location.split(']')[0].replace('[', ''),
        district: prop.location,
        title: `شقة للبيع في ${prop.location}`,
        description: prop.description,
        floor: parseFloor(prop.floor),
        price: parsePrice(prop.price).toString(),
        area: parseArea(prop.area),
      };
    });

    if (convertedProperties.length > 0) {
      setImportQueue(convertedProperties);
      setCurrentImportIndex(0);
      setIsImporting(true);
      setImportStats({ success: 0, failed: 0, total: convertedProperties.length });
    }
  };

  // Auto-submit logic
  useEffect(() => {
    if (isImporting && importQueue.length > 0 && currentImportIndex < importQueue.length) {
      const property = importQueue[currentImportIndex];
      
      const submitTimer = setTimeout(() => {
        handleSubmitProperty(property);
      }, 2000);

      return () => clearTimeout(submitTimer);
    }
  }, [isImporting, importQueue, currentImportIndex]);

  const handleSubmitProperty = async (property: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('انتهت صلاحية الجلسة', 'error');
      setIsImporting(false);
      return;
    }

    // Supported cities list (shared constant identical to the server enum)
    const supportedCities = CITY_OPTIONS;
    
    // Function to find a valid city or return default
    const getValidCity = (inputCity: string) => {
      if (!inputCity) return supportedCities[0]; // Default to first city
      
      // Exact enum value or a known alias (e.g. 'السادات' → 'مدينة السادات')
      const exactMatch = normalizeCity(inputCity);
      if (exactMatch) return exactMatch;
      
      // Try partial matching
      const partialMatch = supportedCities.find(city => 
        city.includes(inputCity.trim()) || inputCity.trim().includes(city)
      );
      if (partialMatch) return partialMatch;
      
      // Return default city if no match found
      return supportedCities[0];
    };

    // Generate fallback values for missing required fields (outside try block)
    const fallbackTitle = property.title || property.location || `عقار رقم ${currentImportIndex + 1}`;
    const fallbackLocation = getValidCity(property.location);
    const fallbackPrice = property.price || '0';
    const fallbackArea = property.area || '100';

    try {
      // Log property being processed (no strict validation - accept all properties)
      const originalLocation = property.location || 'N/A';
      const locationChanged = originalLocation !== fallbackLocation;
      
      console.log(`Processing property: "${fallbackTitle}"`);
      if (locationChanged) {
        console.log(`  📍 Location changed: "${originalLocation}" → "${fallbackLocation}" (using supported city)`);
      }
      console.log(`  💰 Price: ${fallbackPrice}, 📐 Area: ${fallbackArea}`);

      const formDataToSend = new FormData();
      
      // Add property data to FormData using fallback values for missing fields
      formDataToSend.append('category', property.operationType || 'sale');
      formDataToSend.append('type', property.type || 'شقة');
      formDataToSend.append('title', fallbackTitle);
      formDataToSend.append('description', property.description || 'عقار مستورد من ملف Word');
      formDataToSend.append('price', fallbackPrice);
      formDataToSend.append('area', fallbackArea);
      formDataToSend.append('bedrooms', property.bedrooms || '3');
      formDataToSend.append('bathrooms', property.bathrooms || '2');
      formDataToSend.append('location[city]', fallbackLocation);
      formDataToSend.append('location[address]', fallbackLocation);
      formDataToSend.append('location[district]', property.district || fallbackLocation);
      formDataToSend.append('location[latitude]', property.latitude?.toString() || '30.0444');
      formDataToSend.append('location[longitude]', property.longitude?.toString() || '31.2357');
      formDataToSend.append('contactInfo[name]', property.contactInfo?.name || 'إدارة سكنلي');
      formDataToSend.append('contactInfo[phone]', property.contactInfo?.phone || '01000000000');
      formDataToSend.append('contactInfo[email]', property.contactInfo?.email || '');
      formDataToSend.append('contactInfo[whatsapp]', property.contactInfo?.whatsapp || '');
      formDataToSend.append('isNegotiable', String(property.isNegotiable || false));
      formDataToSend.append('floor', property.floor || '1');
      formDataToSend.append('ownershipType', property.ownershipType || 'firstOwner');
      formDataToSend.append('propertyStatus', property.propertyStatus || 'ready');
      formDataToSend.append('paymentMethod', property.paymentMethod || 'cash');
      
      // Add amenities if any
      if (property.amenities && property.amenities.length > 0) {
        property.amenities.forEach((amenity: string) => {
          formDataToSend.append('amenities[]', amenity);
        });
      }

      const response = await fetch(`${API_URL}/properties/addProperty`, {
        method: 'POST',
        headers: authHeader(token),
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Successfully imported property: "${fallbackTitle}" (Original: "${property.title || 'N/A'}")`);
        setImportStats(prev => ({ ...prev, success: prev.success + 1 }));
      } else {
        const errorResult = await response.json().catch(() => ({ message: 'Unknown server error' }));
        console.error(`❌ Failed to import property "${fallbackTitle}": ${response.status} - ${errorResult.message}`);
        setImportStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      }
    } catch (err) {
      console.error(`⚠️ Error submitting property "${fallbackTitle}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      setImportStats(prev => ({ ...prev, failed: prev.failed + 1 }));
    }

    // Move to next property or finish
    if (currentImportIndex < importQueue.length - 1) {
      setCurrentImportIndex(prev => prev + 1);
    } else {
      setIsImporting(false);
      setImportQueue([]);
      setCurrentImportIndex(0);
      showToast(`تم الانتهاء من الاستيراد. نجح: ${importStats.success + 1}, فشل: ${importStats.failed}`, 'success');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>جاري التحقق من الصلاحيات...</Typography>
      </Container>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin')}
            sx={{ mr: 2 }}
          >
            العودة للوحة الإدارة
          </Button>
          <AdminIcon sx={{ fontSize: 32, color: colors.primary[600], mr: 2 }} />
          <Typography variant="h4" sx={{ color: colors.primary[600], fontWeight: 'bold' }}>
            استيراد العقارات من ملف Word
          </Typography>
        </Box>

        {/* Admin Notice */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            هذه الصفحة متاحة للمديرين فقط. يمكنك استيراد عدة عقارات دفعة واحدة من ملف Word.
          </Typography>
        </Alert>

        {/* Import Progress */}
        {isImporting && (
          <Paper elevation={2} sx={{ p: 3, mb: 4, backgroundColor: colors.primary[50] }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="h6" sx={{ mt: 2, color: colors.primary[700] }}>
                جاري استيراد العقار {currentImportIndex + 1} من {importQueue.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {importQueue[currentImportIndex]?.title || 'جاري المعالجة...'}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
                <Typography color="success.main">نجح: {importStats.success}</Typography>
                <Typography color="error.main">فشل: {importStats.failed}</Typography>
                <Typography>المجموع: {importStats.total}</Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Import Component */}
        {!isImporting && (
          <ImportProperties onImportComplete={handleImportedProperties} />
        )}

        {/* Instructions */}
        <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            تعليمات الاستخدام:
          </Typography>
          <Typography variant="body2" component="div">
            <ol>
              <li>قم بإنشاء ملف Word (.docx) يحتوي على جدول بالعقارات</li>
              <li>يجب أن يحتوي الجدول على الأعمدة التالية بالترتيب: الموقع، الوصف، الدور، السعر، المساحة</li>
              <li>الصف الأول يجب أن يحتوي على عناوين الأعمدة</li>
              <li>ارفع الملف باستخدام منطقة السحب والإفلات</li>
              <li>راجع العقارات المستخرجة قبل الاستيراد</li>
              <li>انقر على "استيراد العقارات" لبدء العملية التلقائية</li>
            </ol>
          </Typography>
        </Paper>
      </Paper>
    </Container>
  );
}
