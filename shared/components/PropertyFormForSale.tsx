"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, Button, Typography, Chip,
  OutlinedInput, SelectChangeEvent, IconButton, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { validatePropertyForm, getCurrentAreaConstraints } from "../utils/propertyFormValidation";
import MapPicker from "./MapPicker";
import { useToast } from "../provider/ToastProvider";

const amenities = [
  "تكييف", "مصعد", "شرفة", "موقف سيارات", "مسموح بالحيوانات الأليفة",
  "مفروشة جزئياً", "أمن", "نظام كهرباء ذكي", "مطبخ مجهز", "مخزن"
];

const propertyTypes = [
  { value: 'شقة', label: 'شقة' },
  { value: 'فيلا', label: 'فيلا' },
  { value: 'محل', label: 'محل' },
  { value: 'استوديو', label: 'استوديو' },
  { value: 'دوبلكس', label: 'دوبلكس' },
];

const areaConstraints = {
  'شقة': { min: 60, max: 220 },
  'محل': { min: 60, max: 220 },
  'استوديو': { min: 60, max: 100 },
  'دوبلكس': { min: 180, max: 300 },
  'فيلا': { min: 250, max: 600 },
};

const cities = [
  "شبين الكوم", "منوف", "تلا", "اشمون", "قويسنا", 
  "بركة السبع", "أشمون", "الباجور"
];

const studentRoomTypes = [
  { value: 'private', label: 'غرفة خاصة' },
  { value: 'shared', label: 'غرفة مشتركة' },
  { value: 'dormitory', label: 'سكن جماعي' },
];

const studentGenderPolicies = [
  { value: 'male', label: 'ذكور' },
  { value: 'female', label: 'إناث' },
  { value: 'mixed', label: 'مختلط' },
];

const studentSemesters = [
  { value: 'fall', label: 'الخريف' },
  { value: 'spring', label: 'الربيع' },
  { value: 'summer', label: 'الصيف' },
  { value: 'academic-year', label: 'السنة الأكاديمية' },
  { value: 'full-year', label: 'سنة كاملة' },
];

const initialFormData = {
  operationType: '',
  type: '',
  ownershipType: 'firstOwner',
  area: '',
  bedrooms: '',
  bathrooms: '',
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
  // Rent/Student
  deposit: '',
  leaseDuration: '',
  availableFrom: '',
  utilitiesIncluded: false,
  utilitiesCost: '',
  utilitiesDetails: '',
  rulesPets: false,
  rulesParties: false,
  rulesOther: '',
  // Student
  isStudentFriendly: false,
  studentRoomType: '',
  studentsPerRoom: '',
  studentGenderPolicy: '',
  academicYearOnly: false,
  semester: '',
  nearbyUniversities: [{ name: '', distanceInKm: '' }],
};

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

export default function PropertyFormForSale() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

  // --- State ---
  const [formData, setFormData] = useState(initialFormData);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'error' | 'success' | 'info' | 'warning' });
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setIsAdmin(decoded.role === 'admin');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Get current area constraints based on selected property type
  const getCurrentAreaConstraints = () => {
    return areaConstraints[formData.type as keyof typeof areaConstraints] || { min: 1, max: 1000 };
  };

  // Add this function near the top, after useState declarations:
  const validateField = (name: string, value: any) => {
    const fieldError = validatePropertyForm({ ...formData, [name]: value }).newErrors[name];
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value;

    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [field]: newValue }
      }));
      validateField(`contactInfo.${field}`, newValue);
    } else {
      setFormData(prev => ({ ...prev, [name]: newValue }));
      validateField(name, newValue);
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (name === 'operationType' && value === 'student' && formData.type === 'محل') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        type: '',
        isStudentFriendly: true,
        utilitiesIncluded: true
      }));
    } else if (name === 'operationType' && value === 'student') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        isStudentFriendly: true,
        utilitiesIncluded: true
      }));
    } else if (name === 'operationType' && value !== 'student') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        isStudentFriendly: false,
        utilitiesIncluded: false
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    validateField(name, value);
  };

  const handleAmenitiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selectedAmenities = typeof value === 'string' ? value.split(',') : value;
    setFormData(prev => ({ ...prev, amenities: selectedAmenities }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      const isAnyFileTooLarge = files.some(file => file.size > 5 * 1024 * 1024);
      if (isAnyFileTooLarge) {
        setErrors(prev => ({ ...prev, images: 'الحد الأقصى لحجم الصورة هو 5MB' }));
        return;
      }

      if (formData.images.length + files.length > 20) {
        setErrors(prev => ({ ...prev, images: 'الحد الأقصى لعدد الصور هو 20' }));
        return;
      }

      const newImages = [...formData.images, ...files];
      setFormData(prev => ({ ...prev, images: newImages }));
      setPreviewUrls(newImages.map(file => URL.createObjectURL(file)));
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newImages.length < 1) {
          newErrors.images = 'يجب تحميل صورة واحدة على الأقل';
        } else {
          delete newErrors.images;
        }
        return newErrors;
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewUrls(newPreviewUrls);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newImages.length < 1) {
        newErrors.images = 'يجب تحميل صورة واحدة على الأقل';
      } else {
        delete newErrors.images;
      }
      return newErrors;
    });
  };

  // University handlers
  const handleUniversityChange = (idx: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.nearbyUniversities];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, nearbyUniversities: updated };
    });
  };

  const addUniversity = () => {
    setFormData(prev => ({
      ...prev,
      nearbyUniversities: [...prev.nearbyUniversities, { name: '', distanceInKm: '' }]
    }));
  };

  const removeUniversity = (idx: number) => {
    setFormData(prev => {
      const updated = [...prev.nearbyUniversities];
      updated.splice(idx, 1);
      return { ...prev, nearbyUniversities: updated };
    });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  // عند فتح نافذة اختيار الموقع، فقط افتح الـ Dialog بدون أي setTimeout أو أكواد إضافية
  const handleMapPickerOpen = () => {
    setShowMapPicker(true);
  };

  const showSnackbar = (message: string, severity: 'error' | 'success' | 'info' | 'warning' = 'error') => {
    setSnackbar({ open: true, message, severity });
  };


  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use the new validation function
    const { isValid, newErrors } = validatePropertyForm(formData);
    if (!isValid) {
      setErrors(newErrors);
      showSnackbar('يوجد أخطاء في النموذج، يرجى مراجعة الحقول المطلوبة');
      return;
    }
    
    setErrors({});
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      router.push('/login');
      setIsSubmitting(false);
      return;
    }

    // Validate token
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.role || !decoded.exp || decoded.exp < Date.now() / 1000) {
        throw new Error('توكن غير صالح');
      }
    } catch (err) {
      localStorage.removeItem('token');
      showSnackbar('جلسة العمل منتهية، يرجى تسجيل الدخول مرة أخرى', 'error');
      router.push('/login');
      setIsSubmitting(false);
      return;
    }

    // Prepare form data
    const formDataToSend = new FormData();
    
    // Common fields
    formDataToSend.append('category', formData.operationType);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('area', formData.area);
    formDataToSend.append('bedrooms', formData.bedrooms);
    formDataToSend.append('bathrooms', formData.bathrooms);
    formDataToSend.append('location[city]', formData.location);
    formDataToSend.append('location[address]', formData.location);
    if (formData.district) formDataToSend.append('location[district]', formData.district);
    formDataToSend.append('location[latitude]', formData.latitude.toString());
    formDataToSend.append('location[longitude]', formData.longitude.toString());
    if (formData.totalFloors) formDataToSend.append('totalFloors', formData.totalFloors);
    formDataToSend.append('contactInfo[name]', formData.contactInfo.name);
    formDataToSend.append('contactInfo[phone]', formData.contactInfo.phone);
    if (formData.contactInfo.email) formDataToSend.append('contactInfo[email]', formData.contactInfo.email);
    if (formData.contactInfo.whatsapp) formDataToSend.append('contactInfo[whatsapp]', formData.contactInfo.whatsapp);
    formDataToSend.append('isNegotiable', String(formData.isNegotiable));
    if (formData.floor) formDataToSend.append('floor', formData.floor);

    // Sale fields
    if (formData.operationType === 'sale') {
      formDataToSend.append('ownershipType', formData.ownershipType);
      formDataToSend.append('propertyStatus', formData.propertyStatus);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      if (formData.paymentMethod !== 'cash') {
        if (formData.downPayment) formDataToSend.append('downPayment', formData.downPayment);
        if (formData.installmentPeriodInYears) formDataToSend.append('installmentPeriodInYears', formData.installmentPeriodInYears);
        if (formData.minInstallmentAmount) formDataToSend.append('minInstallmentAmount', formData.minInstallmentAmount);
      }
      if (formData.deliveryDate) formDataToSend.append('deliveryDate', formData.deliveryDate);
      if (formData.deliveryTerms) formDataToSend.append('deliveryTerms', formData.deliveryTerms);
    }

    // Rent/Student fields
    if (['rent', 'student'].includes(formData.operationType)) {
      if (formData.deposit) formDataToSend.append('deposit', formData.deposit);
      if (formData.leaseDuration) formDataToSend.append('leaseDuration', formData.leaseDuration);
      if (formData.availableFrom) formDataToSend.append('availableFrom', formData.availableFrom);
      formDataToSend.append('utilities[included]', String(formData.utilitiesIncluded));
      if (formData.utilitiesCost) formDataToSend.append('utilities[cost]', formData.utilitiesCost);
      if (formData.utilitiesDetails) formDataToSend.append('utilities[details]', formData.utilitiesDetails);
      formDataToSend.append('rules[pets]', String(formData.rulesPets));
      formDataToSend.append('rules[parties]', String(formData.rulesParties));
      if (formData.rulesOther) formDataToSend.append('rules[other]', formData.rulesOther);
    }

    // Student fields
    if (formData.operationType === 'student') {
      formDataToSend.append('isStudentFriendly', String(formData.isStudentFriendly));
      formDataToSend.append('studentHousingDetails[isEnabled]', 'true');
      formDataToSend.append('studentHousingDetails[roomType]', formData.studentRoomType);
      formDataToSend.append('studentHousingDetails[studentsPerRoom]', formData.studentsPerRoom);
      formDataToSend.append('studentHousingDetails[genderPolicy]', formData.studentGenderPolicy);
      formDataToSend.append('studentHousingDetails[academicYearOnly]', String(formData.academicYearOnly));
      if (formData.semester) formDataToSend.append('studentHousingDetails[semester]', formData.semester);
      formData.nearbyUniversities.forEach((uni, idx) => {
        if (uni.name && uni.distanceInKm) {
          formDataToSend.append(`studentHousingDetails[nearbyUniversities][${idx}][name]`, uni.name);
          formDataToSend.append(`studentHousingDetails[nearbyUniversities][${idx}][distanceInKm]`, uni.distanceInKm);
        }
      });
    }

    // Amenities and images
    formData.amenities.forEach(item => formDataToSend.append('amenities[]', item));
    formData.images.forEach(file => formDataToSend.append('media', file));

    // Submit to API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/properties/addProperty`, {
        method: 'POST',
        headers: { Authorization: `Saknly__${token}` },
        body: formDataToSend
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        showSnackbar('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 'error');
        router.push('/login');
        return;
      }

      const result = await response.json();

      if (response.ok) {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded.role === 'admin') {
            showSnackbar('تمت إضافة العقار بنجاح وسيظهر مباشرة', 'success');
            router.push('/properties');
          } else {
            setPendingOpen(true);
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          setPendingOpen(true);
        }
        return;
      }
      
      throw new Error(result.message || `خطأ من الخادم: ${response.status}`);
    } catch (err) {
      console.error('Error submitting form:', err);
      showSnackbar(`حدث خطأ أثناء إرسال البيانات: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Clean up preview URLs ---
  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  // --- Render ---
  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{
        background: "#fff", 
        p: { xs: 2, md: 6 }, 
        borderRadius: "24px",
        boxShadow: `0 8px 32px 0 rgba(37, 99, 235, 0.18)`, // Using primary[600] rgba
        maxWidth: "800px",
        mx: "auto", 
        mt: 5, 
        mb: 5, 
        border: `2px solid ${colors.primary[600]}`,
        gap: 4, 
        display: "flex",
        flexDirection: "column",
        direction: "rtl"
      }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{
          color: colors.primary[600], 
          letterSpacing: "1px", 
          textAlign: "center", 
          mb: 2,
          textShadow: `0 2px 8px ${colors.primary[100]}`
        }}>
          إضافة عقار
        </Typography>

        {/* Category and Type */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <FormControl fullWidth error={!!errors.operationType}>
            <InputLabel sx={{ color: colors.primary[600] }}>نوع العملية</InputLabel>
            <Select
              name="operationType"
              value={formData.operationType}
              onChange={handleSelectChange}
              label="نوع العملية"
              sx={{ 
                color: colors.secondary[800], 
                '& .MuiSelect-icon': { color: colors.primary[600] } 
              }}
            >
              <MenuItem value="rent">ايجار</MenuItem>
              <MenuItem value="sale">بيع</MenuItem>
              <MenuItem value="student">سكن طلبة</MenuItem>
            </Select>
            {errors.operationType && <Typography color="error" variant="caption">{errors.operationType}</Typography>}
          </FormControl>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel sx={{ color: colors.primary[600] }}>نوع العقار</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleSelectChange}
              label="نوع العقار"
              sx={{ 
                color: colors.secondary[800], 
                '& .MuiSelect-icon': { color: colors.primary[600] } 
              }}
            >
              {propertyTypes.map(opt => (
                <MenuItem 
                  key={opt.value} 
                  value={opt.value}
                  disabled={formData.operationType === 'student' && opt.value === 'محل'}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.type && <Typography color="error" variant="caption">{errors.type}</Typography>}
            {formData.operationType === 'student' && (
              <Typography variant="caption" sx={{ color: '#666', mt: 0.5, display: 'block' }}>
                سكن الطلبة متاح فقط للشقق والاستديوهات
              </Typography>
            )}
          </FormControl>
        </Box>

        {/* Sale fields */}
        {formData.operationType === 'sale' && (
          <>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.primary[600] }}>نوع الملكية</InputLabel>
                <Select
                  name="ownershipType"
                  value={formData.ownershipType}
                  onChange={handleSelectChange}
                  label="نوع الملكية"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  <MenuItem value="firstOwner">تمليك (مالك أول)</MenuItem>
                  <MenuItem value="resale">تمليك (إعادة بيع)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.primary[600] }}>حالة العقار</InputLabel>
                <Select
                  name="propertyStatus"
                  value={formData.propertyStatus}
                  onChange={handleSelectChange}
                  label="حالة العقار"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  <MenuItem value="ready">جاهز</MenuItem>
                  <MenuItem value="underConstruction">قيد الإنشاء</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.primary[600] }}>طريقة الدفع</InputLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleSelectChange}
                  label="طريقة الدفع"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  <MenuItem value="cash">كاش</MenuItem>
                  <MenuItem value="installment">تقسيط</MenuItem>
                  <MenuItem value="cashOrInstallment">كاش أو تقسيط</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {formData.paymentMethod !== 'cash' && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
                <TextField 
                  label="المقدم" 
                  name="downPayment" 
                  value={formData.downPayment} 
                  onChange={handleInputChange} 
                  fullWidth 
                  error={!!errors.downPayment}
                  helperText={errors.downPayment}
                />
                <FormControl fullWidth error={!!errors.installmentPeriodInYears}>
                  <InputLabel sx={{ color: colors.primary[600] }}>فترة التقسيط (سنوات)</InputLabel>
                  <Select
                    name="installmentPeriodInYears"
                    value={formData.installmentPeriodInYears}
                    onChange={handleSelectChange}
                    label="فترة التقسيط (سنوات)"
                    sx={{ 
                      color: colors.secondary[800], 
                      '& .MuiSelect-icon': { color: colors.primary[600] } 
                    }}
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                      <MenuItem key={num} value={num.toString()}>{num}</MenuItem>
                    ))}
                  </Select>
                  {errors.installmentPeriodInYears && <Typography color="error" variant="caption">{errors.installmentPeriodInYears}</Typography>}
                </FormControl>
                <TextField 
                  label="الحد الأدنى للقسط" 
                  name="minInstallmentAmount" 
                  value={formData.minInstallmentAmount} 
                  onChange={handleInputChange} 
                  fullWidth 
                />
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
              <TextField 
                label="تاريخ التسليم" 
                name="deliveryDate" 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                value={formData.deliveryDate} 
                onChange={handleInputChange} 
                fullWidth 
              />
              <TextField 
                label="شروط التسليم" 
                name="deliveryTerms" 
                value={formData.deliveryTerms} 
                onChange={handleInputChange} 
                fullWidth 
                multiline 
                rows={2} 
                error={!!errors.deliveryTerms}
                helperText={
                  errors.deliveryTerms ? 
                    <span style={{color: colors.danger[600]}}>{errors.deliveryTerms}</span> : 
                    <span style={{color: colors.secondary[500]}}>{`${formData.deliveryTerms.length}/300 حرف`}</span>
                }
                inputProps={{ maxLength: 300 }}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: errors.deliveryTerms ? 'error.main' : 'text.secondary',
                  }
                }}
              />
            </Box>
          </>
        )}

        {/* Rent/Student fields */}
        {(formData.operationType === 'rent' || formData.operationType === 'student') && (
          <>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
              <TextField 
                label="التأمين (مبلغ التأمين)" 
                name="deposit" 
                value={formData.deposit} 
                onChange={handleInputChange} 
                fullWidth 
                error={!!errors.deposit}
                helperText={errors.deposit}
                type="number"
                inputProps={{ 
                  min: 0,
                  max: 100000000
                }}
                onKeyDown={(e) => {
                  // Allow: backspace, delete, tab, escape, enter, and numbers
                  if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true) ||
                      // Allow numbers only
                      (e.keyCode >= 48 && e.keyCode <= 57)) {
                    return;
                  }
                  e.preventDefault();
                }}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData('text');
                  const numericRegex = /^[0-9]+$/;
                  if (!numericRegex.test(pastedText)) {
                    e.preventDefault();
                  }
                }}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: errors.deposit ? 'error.main' : 'text.secondary',
                  },
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
              <FormControl fullWidth error={!!errors.leaseDuration}>
                <InputLabel sx={{ color: colors.primary[600] }}>عدد أشهر الايجار</InputLabel>
                <Select
                  name="leaseDuration"
                  value={formData.leaseDuration}
                  onChange={handleSelectChange}
                  label="عدد أشهر الايجار"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  {Array.from({ length: 120 }, (_, i) => i + 1).map(num => (
                    <MenuItem key={num} value={num.toString()}>{num}</MenuItem>
                  ))}
                </Select>
                {errors.leaseDuration && <Typography color="error" variant="caption">{errors.leaseDuration}</Typography>}
              </FormControl>
              <TextField 
                label="تاريخ التوفر" 
                name="availableFrom" 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                value={formData.availableFrom} 
                onChange={handleInputChange} 
                fullWidth 
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
              <TextField 
                label="شروط أخرى" 
                name="rulesOther" 
                value={formData.rulesOther} 
                onChange={handleInputChange} 
                fullWidth 
                disabled={formData.type === 'محل'}
                error={!!errors.rulesOther}
                helperText={
                  errors.rulesOther ? 
                    <span style={{color: colors.danger[600]}}>{errors.rulesOther}</span> : 
                    <span style={{color: colors.secondary[500]}}>{`${formData.rulesOther.length}/300 حرف`}</span>
                }
                inputProps={{ maxLength: 300 }}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: errors.rulesOther ? 'error.main' : 'text.secondary',
                  }
                }}
              />
            </Box>
          </>
        )}

        {/* Student Housing fields */}
        {formData.operationType === 'student' && (
          <>
            <Divider sx={{ 
              my: 2,
              backgroundColor: colors.secondary[300],
              borderColor: colors.secondary[300]
            }} />
            <Typography variant="h6" sx={{ color: colors.primary[600] }}>تفاصيل سكن الطلبة</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
              <FormControl fullWidth error={!!errors.studentRoomType}>
                <InputLabel sx={{ color: colors.primary[600] }}>نوع الغرفة</InputLabel>
                <Select
                  name="studentRoomType"
                  value={formData.studentRoomType}
                  onChange={handleSelectChange}
                  label="نوع الغرفة"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  {studentRoomTypes.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
                {errors.studentRoomType && <Typography color="error" variant="caption">{errors.studentRoomType}</Typography>}
              </FormControl>
              <FormControl fullWidth error={!!errors.studentsPerRoom}>
                <InputLabel sx={{ color: colors.primary[600] }}>عدد الطلاب في الغرفة</InputLabel>
                <Select
                  name="studentsPerRoom"
                  value={formData.studentsPerRoom}
                  onChange={handleSelectChange}
                  label="عدد الطلاب في الغرفة"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  {Array.from({ length: 4 }, (_, i) => i + 1).map(num => (
                    <MenuItem key={num} value={num.toString()}>{num}</MenuItem>
                  ))}
                </Select>
                {errors.studentsPerRoom && <Typography color="error" variant="caption">{errors.studentsPerRoom}</Typography>}
              </FormControl>
              <FormControl fullWidth error={!!errors.studentGenderPolicy}>
                <InputLabel sx={{ color: colors.primary[600] }}>سياسة النوع</InputLabel>
                <Select
                  name="studentGenderPolicy"
                  value={formData.studentGenderPolicy}
                  onChange={handleSelectChange}
                  label="سياسة النوع"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  {studentGenderPolicies.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
                {errors.studentGenderPolicy && <Typography color="error" variant="caption">{errors.studentGenderPolicy}</Typography>}
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
              <FormControlLabel 
                control={<Checkbox name="academicYearOnly" checked={formData.academicYearOnly} onChange={handleInputChange} />} 
                label="للعام الأكاديمي فقط" 
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.primary[600] }}>الفصل الدراسي</InputLabel>
                <Select
                  name="semester"
                  value={formData.semester}
                  onChange={handleSelectChange}
                  label="الفصل الدراسي"
                  sx={{ 
                    color: colors.secondary[800], 
                    '& .MuiSelect-icon': { color: colors.primary[600] } 
                  }}
                >
                  {studentSemesters.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">الجامعات القريبة</Typography>
              {formData.nearbyUniversities.map((uni, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                  <TextField 
                    label="اسم الجامعة" 
                    value={uni.name} 
                    onChange={e => handleUniversityChange(idx, 'name', e.target.value)} 
                  />
                  <TextField 
                    label="المسافة (كم)" 
                    value={uni.distanceInKm} 
                    onChange={e => handleUniversityChange(idx, 'distanceInKm', e.target.value)} 
                  />
                  <IconButton onClick={() => removeUniversity(idx)} disabled={formData.nearbyUniversities.length === 1}>
                    <DeleteIcon sx={{ color: colors.danger[600], fontSize: 20 }} />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={addUniversity} sx={{ mt: 1 }}>إضافة جامعة</Button>
              {errors.nearbyUniversities && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.nearbyUniversities}
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* Area, Bedrooms, Bathrooms */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField 
            label={`المساحة (م²) ${formData.type ? `(${getCurrentAreaConstraints().min}-${getCurrentAreaConstraints().max})` : ''}`}
            name="area" 
            value={formData.area} 
            onChange={handleInputChange} 
            fullWidth 
            error={!!errors.area}
            helperText={
              errors.area ? 
                <span style={{color: colors.danger[600]}}>{errors.area}</span> : 
                <span style={{color: colors.secondary[500]}}>{formData.type ? `المساحة المطلوبة: ${getCurrentAreaConstraints().min}-${getCurrentAreaConstraints().max} متر مربع` : ''}</span>
            }
            placeholder={formData.type ? `${getCurrentAreaConstraints().min}-${getCurrentAreaConstraints().max}` : ''}
            type="number"
            inputProps={{ 
              min: formData.type ? getCurrentAreaConstraints().min : 0,
              max: formData.type ? getCurrentAreaConstraints().max : 1000
            }}
            onKeyDown={(e) => {
              // Allow: backspace, delete, tab, escape, enter, and numbers
              if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow numbers only
                  (e.keyCode >= 48 && e.keyCode <= 57)) {
                return;
              }
              e.preventDefault();
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              const numericRegex = /^[0-9]+$/;
              if (!numericRegex.test(pastedText)) {
                e.preventDefault();
              }
            }}
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors.area ? 'error.main' : 'text.secondary',
              },
              // Hide arrows in Chrome, Safari, Edge, Opera
              '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              // Hide arrows in Firefox
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
            }}
          />
          <FormControl fullWidth error={!!errors.bedrooms}
            disabled={formData.type === 'محل'}
          >
            <InputLabel sx={{ color: colors.primary[600] }}>غرف نوم</InputLabel>
            <Select
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleSelectChange}
              label="غرف نوم"
              sx={{ 
                color: colors.secondary[800], 
                '& .MuiSelect-icon': { color: colors.primary[600] } 
              }}
              disabled={formData.type === 'محل'}
            >
              {Array.from({ length: 11 }, (_, i) => i+1).map(num => (
                <MenuItem key={num} value={num.toString()}>{num}</MenuItem>
              ))}
            </Select>
            {errors.bedrooms && <Typography color="error" variant="caption">{errors.bedrooms}</Typography>}
          </FormControl>
          <FormControl fullWidth error={!!errors.bathrooms}>
            <InputLabel sx={{ color: colors.primary[600] }}>حمامات</InputLabel>
            <Select
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleSelectChange}
              label="حمامات"
              sx={{ 
                color: colors.secondary[800], 
                '& .MuiSelect-icon': { color: colors.primary[600] } 
              }}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                <MenuItem key={num} value={num.toString()}>{num}</MenuItem>
              ))}
            </Select>
            {errors.bathrooms && <Typography color="error" variant="caption">{errors.bathrooms}</Typography>}
          </FormControl>
        </Box>

        {/* Floor, Total Floors, Location, District */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <FormControl fullWidth error={!!errors.floor}>
            <InputLabel sx={{ color: colors.primary[600] }}>الطابق</InputLabel>
            <Select
              name="floor"
              value={formData.floor}
              onChange={handleSelectChange}
              label="الطابق"
              sx={{ 
                color: colors.secondary[800], 
                '& .MuiSelect-icon': { color: colors.primary[600] } 
              }}
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                <MenuItem key={num} value={num}>{num}</MenuItem>
              ))}
            </Select>
            {errors.floor === 'لا يمكن أن يكون الطابق أكبر من إجمالي الطوابق' && (
              <Typography variant="caption" sx={{ color: colors.danger[600], mt: 1 }}>
                لا يمكن أن يكون الطابق أكبر من عدد الطوابق الكلي للعقار
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ color: colors.primary[600] }}>إجمالي الطوابق</InputLabel>
            <Select
              name="totalFloors"
              value={formData.totalFloors}
              onChange={handleSelectChange}
              label="إجمالي الطوابق"
              sx={{ 
                color: colors.secondary[800], 
                '& .MuiSelect-icon': { color: colors.primary[600] } 
              }}
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                <MenuItem key={num} value={num.toString()}>{num}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <FormControl fullWidth error={!!errors.location}>
            <InputLabel sx={{ color: colors.primary[600] }}>المدينة</InputLabel>
            <Select
              name="location"
              value={formData.location}
              onChange={handleSelectChange}
              label="المدينة"
              sx={{ 
                color: colors.secondary[800], 
                '& .MuiSelect-icon': { color: colors.primary[600] } 
              }}
            >
              {cities.map(city => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
            {errors.location && <Typography color="error" variant="caption">{errors.location}</Typography>}
          </FormControl>
          <TextField 
            label="الحي/المنطقة" 
            name="district" 
            value={formData.district} 
            onChange={handleInputChange} 
            fullWidth 
            error={!!errors.district}
            helperText={
              errors.district ? 
                <span style={{color: colors.danger[600]}}>{errors.district}</span> : 
                <span style={{color: colors.secondary[500]}}>{`${formData.district.length}/50 حرف`}</span>
            }
            inputProps={{ maxLength: 50 }}
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors.district ? 'error.main' : 'text.secondary',
              }
            }}
          />
        </Box>

        {/* Location Coordinates */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: colors.primary[600] }}>
            موقع العقار على الخريطة
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="خط العرض (Latitude)"
              value={formData.latitude}
              size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="خط الطول (Longitude)"
              value={formData.longitude}
              size="small"
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleMapPickerOpen}
              sx={{ minWidth: 'auto', px: 3 }}
            >
              اختر الموقع
            </Button>
          </Box>
        </Box>

        {/* Amenities */}
        <FormControl fullWidth>
          <InputLabel sx={{ color: colors.primary[600] }}>المرافق والخدمات</InputLabel>
          <Select
            multiple
            name="amenities"
            value={formData.amenities}
            onChange={handleAmenitiesChange}
            input={<OutlinedInput label="المرافق والخدمات" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {amenities.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={formData.amenities.indexOf(name) > -1} />
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Title and Description */}
        <TextField 
          label="عنوان الإعلان" 
          name="title" 
          value={formData.title} 
          onChange={handleInputChange} 
          fullWidth 
          error={!!errors.title}
          helperText={
            errors.title ? 
              <span style={{color: colors.danger[600]}}>{errors.title}</span> : 
              <span style={{color: colors.secondary[500]}}>{`${formData.title.length}/70 حرف`}</span>
          }
          inputProps={{ maxLength: 70 }}
          sx={{
            '& .MuiFormHelperText-root': {
              color: errors.title ? 'error.main' : 'text.secondary',
            }
          }}
        />
        <TextField 
          label="وصف العقار" 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange} 
          multiline 
          rows={4} 
          fullWidth 
          error={!!errors.description}
          helperText={
            errors.description ? 
              <span style={{color: colors.danger[600]}}>{errors.description}</span> : 
              <span style={{color: colors.secondary[500]}}>{`${formData.description.length}/400 حرف`}</span>
          }
          inputProps={{ maxLength: 400 }}
          sx={{
            '& .MuiFormHelperText-root': {
              color: errors.description ? 'error.main' : 'text.secondary',
            }
          }}
        />

        <Divider sx={{ 
          my: 2,
          backgroundColor: colors.secondary[300],
          borderColor: colors.secondary[300]
        }} />

        {/* Price and Contact Info */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField 
            label="السعر" 
            name="price" 
            value={formData.price} 
            onChange={handleInputChange} 
            fullWidth 
            error={!!errors.price}
            helperText={errors.price || 'أقصى سعر: 100 مليون جنيه'}
            type="number"
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors.price ? 'error.main' : 'text.secondary',
              },
              '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
            }}
          />
          <FormControlLabel 
            control={<Checkbox name="isNegotiable" checked={formData.isNegotiable} onChange={handleInputChange} />} 
            label="السعر قابل للتفاوض" 
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField 
            label="اسم المسؤول" 
            name="contactInfo.name" 
            value={formData.contactInfo.name} 
            onChange={handleInputChange} 
            fullWidth 
            error={!!errors['contactInfo.name']}
            helperText={
              errors['contactInfo.name']
                ? errors['contactInfo.name']
                : `${formData.contactInfo.name.length}/25 حرف`
            }
            inputProps={{ maxLength: 25 }}
            onKeyDown={(e) => {
              // Allow: backspace, delete, tab, escape, enter, and Arabic letters
              if ([8, 9, 27, 13, 46, 32].indexOf(e.keyCode) !== -1 ||
                  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow Arabic letters (Unicode range for Arabic)
                  (e.keyCode >= 65 && e.keyCode <= 90) || // English letters
                  (e.keyCode >= 97 && e.keyCode <= 122) || // English letters lowercase
                  (e.keyCode >= 1570 && e.keyCode <= 1610)) { // Arabic letters
                return;
              }
              e.preventDefault();
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              const arabicRegex = /^[ء-ي\s]+$/;
              if (!arabicRegex.test(pastedText)) {
                e.preventDefault();
              }
            }}
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors['contactInfo.name'] ? undefined : '#888',
              }
            }}
          />
          <TextField 
            label="رقم الهاتف" 
            name="contactInfo.phone" 
            value={formData.contactInfo.phone} 
            onChange={handleInputChange} 
            fullWidth 
            error={!!errors['contactInfo.phone']}
            helperText={
              errors['contactInfo.phone']
                ? errors['contactInfo.phone']
                : `${formData.contactInfo.phone.length}/11 رقم`
            }
            inputProps={{ maxLength: 11 }}
            type="tel"
            onKeyDown={(e) => {
              // Allow: backspace, delete, tab, escape, enter, and numbers
              if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow numbers only
                  (e.keyCode >= 48 && e.keyCode <= 57)) {
                return;
              }
              e.preventDefault();
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              const numericRegex = /^[0-9]+$/;
              if (!numericRegex.test(pastedText)) {
                e.preventDefault();
              }
            }}
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors['contactInfo.phone'] ? undefined : '#888',
              }
            }}
          />
          <TextField
            label="البريد الإلكتروني (اختياري)"
            name="contactInfo.email"
            value={formData.contactInfo.email}
            onChange={handleInputChange}
            fullWidth
            error={!!errors['contactInfo.email']}
            helperText={errors['contactInfo.email']}
            type="email"
          />
          <TextField
            label="رقم واتساب (اختياري)"
            name="contactInfo.whatsapp"
            value={formData.contactInfo.whatsapp}
            onChange={handleInputChange}
            fullWidth
            error={!!errors['contactInfo.whatsapp']}
            helperText={
              errors['contactInfo.whatsapp'] ? 
                <span style={{color: colors.danger[600]}}>{errors['contactInfo.whatsapp']}</span> : 
                <span style={{color: colors.secondary[500]}}>{`${formData.contactInfo.whatsapp.length}/11 رقم`}</span>
            }
            inputProps={{ maxLength: 11 }}
            type="tel"
            onKeyDown={(e) => {
              if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  (e.keyCode >= 48 && e.keyCode <= 57)) {
                return;
              }
              e.preventDefault();
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              const numericRegex = /^[0-9]+$/;
              if (!numericRegex.test(pastedText)) {
                e.preventDefault();
              }
            }}
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors['contactInfo.whatsapp'] ? 'error.main' : 'text.secondary',
              }
            }}
          />
        </Box>

        {/* Image Upload */}
        <FormControl fullWidth error={!!errors.images}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{
              color: colors.primary[600],
              borderColor: colors.primary[600],
              '&:hover': { borderColor: colors.primary[700] },
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            تحميل الصور (5-20 صورة)
          </Button>
          {previewUrls.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {previewUrls.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 200,
                    height: 150,
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={url}
                    alt={`معاينة ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    onClick={() => removeImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                    }}
                  >
                    <DeleteIcon sx={{ color: colors.danger[600], fontSize: 20 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          <Typography variant="body2" sx={{ mt: 1, color: errors.images ? 'error.main' : '#666' }}>
            {errors.images ? errors.images : `${formData.images.length} / 20 صورة مختارة`}
          </Typography>
        </FormControl>



        {/* Admin Import Button */}
        {isAdmin && (
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => router.push('/admin/import-properties')}
            sx={{
              borderColor: colors.primary[600],
              color: colors.primary[600],
              '&:hover': { 
                borderColor: colors.primary[700],
                backgroundColor: colors.primary[50]
              },
              borderRadius: 2,
              fontWeight: 700,
              mt: 2,
              mb: 1
            }}
          >
            استيراد العقارات من Word
          </Button>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={24} /> : null}
          sx={{
            backgroundColor: colors.primary[600],
            '&:hover': { backgroundColor: colors.primary[700] },
            color: '#fff',
            borderRadius: 2,
            fontWeight: 700,
            mt: 3
          }}
        >
          {isSubmitting ? 'جاري النشر...' : 'نشر الإعلان'}
        </Button>
      </Box>

      {/* Pending Approval Dialog */}
      <Dialog open={pendingOpen} onClose={() => setPendingOpen(false)}>
        <DialogTitle sx={{ 
          backgroundColor: colors.primary[50],
          color: colors.primary[900],
          fontWeight: 'bold'
        }}>في انتظار الموافقة</DialogTitle>
        <DialogContent>
          سيتم مراجعة إعلانك من قبل الإدارة قبل النشر. شكراً لاستخدامك سكنلي!
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPendingOpen(false); router.push('/userProfile'); }}>
            حسناً
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Picker Dialog */}
      <Dialog 
        open={showMapPicker} 
        onClose={() => setShowMapPicker(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            minHeight: '600px'
          }
        }}
        TransitionProps={{
          // احذف أي onEntered أو أكواد تخص invalidateSize هنا
        }}
      >
        <DialogContent sx={{ p: 2, height: '100%' }}>
          <MapPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
            selectedCity={formData.location}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

