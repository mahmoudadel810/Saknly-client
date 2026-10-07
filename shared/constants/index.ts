/** @format */

import { PropertyType, PropertyCategory, Currency, AreaUnit } from "../types";

// Property Constants
export const PROPERTY_TYPES: Array<{
  value: PropertyType;
  label: string;
  labelAr: string;
}> = [
  { value: "apartment", label: "Apartment", labelAr: "شقة" },
  { value: "house", label: "House", labelAr: "منزل" },
  { value: "villa", label: "Villa", labelAr: "فيلا" },
  { value: "studio", label: "Studio", labelAr: "استوديو" },
  { value: "penthouse", label: "Penthouse", labelAr: "بنتهاوس" },
  { value: "duplex", label: "Duplex", labelAr: "دوبلكس" },
  { value: "commercial", label: "Commercial", labelAr: "تجاري" },
];

export const PROPERTY_CATEGORIES: Array<{
  value: PropertyCategory;
  label: string;
  labelAr: string;
}> = [
  { value: "rent", label: "For Rent", labelAr: "للإيجار" },
  { value: "sale", label: "For Sale", labelAr: "للبيع" },
];

export const CURRENCIES: Array<{
  value: Currency;
  label: string;
  symbol: string;
}> = [
  { value: "EGP", label: "Egyptian Pound", symbol: "ج.م" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
];

export const AREA_UNITS: Array<{
  value: AreaUnit;
  label: string;
  labelAr: string;
}> = [
  { value: "sqm", label: "Square Meters", labelAr: "متر مربع" },
  { value: "sqft", label: "Square Feet", labelAr: "قدم مربع" },
];

export const AMENITIES = [
  { value: "parking", label: "Parking", labelAr: "موقف سيارات", icon: "🚗" },
  { value: "elevator", label: "Elevator", labelAr: "مصعد", icon: "🛗" },
  { value: "balcony", label: "Balcony", labelAr: "شرفة", icon: "🏠" },
  { value: "garden", label: "Garden", labelAr: "حديقة", icon: "🌳" },
  { value: "pool", label: "Swimming Pool", labelAr: "حمام سباحة", icon: "🏊" },
  { value: "gym", label: "Gym", labelAr: "صالة رياضية", icon: "💪" },
  { value: "security", label: "Security", labelAr: "أمن", icon: "🔒" },
  { value: "internet", label: "Internet", labelAr: "إنترنت", icon: "📶" },
  {
    value: "airConditioning",
    label: "Air Conditioning",
    labelAr: "تكييف",
    icon: "❄️",
  },
  { value: "heating", label: "Heating", labelAr: "تدفئة", icon: "🔥" },
  { value: "furnished", label: "Furnished", labelAr: "مفروش", icon: "🛋️" },
  {
    value: "pets",
    label: "Pet Friendly",
    labelAr: "يسمح بالحيوانات",
    icon: "🐕",
  },
  { value: "laundry", label: "Laundry", labelAr: "غسيل", icon: "👕" },
  { value: "storage", label: "Storage", labelAr: "تخزين", icon: "📦" },
  { value: "garage", label: "Garage", labelAr: "كراج", icon: "🏠" },
  { value: "terrace", label: "Terrace", labelAr: "شرفة علوية", icon: "🌅" },
  { value: "fireplace", label: "Fireplace", labelAr: "مدفأة", icon: "🔥" },
  {
    value: "dishwasher",
    label: "Dishwasher",
    labelAr: "غسالة أطباق",
    icon: "🍽️",
  },
];

export const EGYPTIAN_CITIES = [
  { value: "cairo", label: "Cairo", labelAr: "القاهرة" },
  { value: "alexandria", label: "Alexandria", labelAr: "الإسكندرية" },
  { value: "giza", label: "Giza", labelAr: "الجيزة" },
  { value: "sharm-el-sheikh", label: "Sharm El Sheikh", labelAr: "شرم الشيخ" },
  { value: "hurghada", label: "Hurghada", labelAr: "الغردقة" },
  { value: "luxor", label: "Luxor", labelAr: "الأقصر" },
  { value: "aswan", label: "Aswan", labelAr: "أسوان" },
  { value: "port-said", label: "Port Said", labelAr: "بورسعيد" },
  { value: "suez", label: "Suez", labelAr: "السويس" },
  { value: "ismailia", label: "Ismailia", labelAr: "الإسماعيلية" },
  { value: "tanta", label: "Tanta", labelAr: "طنطا" },
  { value: "mansoura", label: "Mansoura", labelAr: "المنصورة" },
  { value: "zagazig", label: "Zagazig", labelAr: "الزقازيق" },
  { value: "damanhur", label: "Damanhur", labelAr: "دمنهور" },
  { value: "minya", label: "Minya", labelAr: "المنيا" },
  { value: "qena", label: "Qena", labelAr: "قنا" },
  { value: "sohag", label: "Sohag", labelAr: "سوهاج" },
  { value: "beni-suef", label: "Beni Suef", labelAr: "بني سويف" },
  { value: "fayyum", label: "Fayyum", labelAr: "الفيوم" },
  { value: "new-cairo", label: "New Cairo", labelAr: "القاهرة الجديدة" },
  {
    value: "new-administrative-capital",
    label: "New Administrative Capital",
    labelAr: "العاصمة الإدارية الجديدة",
  },
  {
    value: "6th-october",
    label: "6th of October",
    labelAr: "السادس من أكتوبر",
  },
  { value: "sheikh-zayed", label: "Sheikh Zayed", labelAr: "الشيخ زايد" },
];

// UI Constants
export const PAGINATION_LIMITS = [12, 24, 36, 48] as const;
export const DEFAULT_PAGE_SIZE = 12;

export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 1600,
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_PROPERTY: 10,
  PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  ARABIC_NAME_PATTERN: /^[a-zA-Z\u0600-\u06FF\s]+$/,
} as const;

// Date and Time Constants
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy HH:mm",
  INPUT: "yyyy-MM-dd",
  API: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "saknly_auth_token",
  USER_DATA: "saknly_user_data",
  LANGUAGE: "saknly_language",
  THEME: "saknly_theme",
  SEARCH_FILTERS: "saknly_search_filters",
  RECENTLY_VIEWED: "saknly_recently_viewed",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You need to log in to access this page.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  FILE_TOO_LARGE: "File size is too large. Maximum size is 10MB.",
  INVALID_FILE_TYPE: "Invalid file type. Only images are allowed.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Welcome back!",
  REGISTER_SUCCESS: "Account created successfully!",
  LOGOUT_SUCCESS: "You have been logged out.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PROPERTY_CREATED: "Property created successfully.",
  PROPERTY_UPDATED: "Property updated successfully.",
  PROPERTY_DELETED: "Property deleted successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  EMAIL_VERIFIED: "Email verified successfully.",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_EMAIL: "/auth/verify",
  PROPERTIES: "/properties",
  PROPERTY_DETAILS: (id: string) => `/properties/${id}`,
  CREATE_PROPERTY: "/properties/create",
  EDIT_PROPERTY: (id: string) => `/properties/${id}/edit`,
  DASHBOARD: "/dashboard",
  PROFILE: "/dashboard/profile",
  MY_PROPERTIES: "/dashboard/properties",
  FAVORITES: "/dashboard/favorites",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_PROPERTIES: "/admin/properties",
  ADMIN_ANALYTICS: "/admin/analytics",
} as const;

export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com/saknly",
  TWITTER: "https://twitter.com/saknly",
  INSTAGRAM: "https://instagram.com/saknly",
  LINKEDIN: "https://linkedin.com/company/saknly",
  YOUTUBE: "https://youtube.com/saknly",
} as const;

export const CONTACT_INFO = {
  EMAIL: "info@saknly.com",
  PHONE: "+20 100 123 4567",
  WHATSAPP: "+20 100 123 4567",
  ADDRESS: "Cairo, Egypt",
} as const;

// Language Configuration
export const LANGUAGE_CONFIG = {
  default: "ar",
  supported: ["ar", "en"],
  fallback: "ar",
  rtl: ["ar"],
  ltr: ["en"],
};

// Arabic Language Settings
export const ARABIC_CONFIG = {
  code: "ar",
  name: "العربية",
  nativeName: "العربية",
  direction: "rtl",
  locale: "ar-EG",
  dateFormat: "DD/MM/YYYY",
  numberFormat: {
    decimal: ".",
    thousands: ",",
    currency: "ج.م",
  },
};

// English Language Settings
export const ENGLISH_CONFIG = {
  code: "en",
  name: "English",
  nativeName: "English",
  direction: "ltr",
  locale: "en-US",
  dateFormat: "MM/DD/YYYY",
  numberFormat: {
    decimal: ".",
    thousands: ",",
    currency: "EGP",
  },
};

// Platform-specific language settings
export const PLATFORM_LANGUAGE_CONFIG = {
  web: {
    default: "ar",
    supported: ["ar", "en"],
    fallback: "ar",
  },
  mobile: {
    default: "ar",
    supported: ["ar", "en"],
    fallback: "ar",
  },
  api: {
    default: "ar",
    supported: ["ar", "en"],
    fallback: "ar",
  },
};

// SEO and Meta Configuration
export const SEO_CONFIG = {
  defaultLanguage: "ar",
  defaultLocale: "ar-EG",
  alternateLanguages: {
    "ar-EG": "/",
    "en-US": "/en",
  },
  defaultTitle: "سكنلي - شريكك في العقارات",
  defaultDescription:
    "اعثر على منزلك المثالي مع سكنلي. تصفح الشقق والمنازل والعقارات للإيجار أو البيع في مصر.",
  defaultKeywords: [
    "عقارات",
    "عقار",
    "إيجار",
    "بيع",
    "شقة",
    "منزل",
    "مصر",
    "القاهرة",
    "الإسكندرية",
  ],
};

// Direction Configuration
export const DIRECTION_CONFIG = {
  rtl: {
    textAlign: "right",
    flexDirection: "row-reverse",
    marginStart: "margin-right",
    marginEnd: "margin-left",
    paddingStart: "padding-right",
    paddingEnd: "padding-left",
    borderStart: "border-right",
    borderEnd: "border-left",
  },
  ltr: {
    textAlign: "left",
    flexDirection: "row",
    marginStart: "margin-left",
    marginEnd: "margin-right",
    paddingStart: "padding-left",
    paddingEnd: "padding-right",
    borderStart: "border-left",
    borderEnd: "border-right",
  },
};
