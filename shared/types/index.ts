/** @format */

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: {
    publicId: string;
    url: string;
  };
  role: "user" | "admin";
  isVerified: boolean;
  language: "en" | "ar";
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  preferences?: {
    propertyTypes?: PropertyType[];
    priceRange?: {
      min: number;
      max: number;
    };
    location?: string;
    notifications?: {
      email: boolean;
      sms: boolean;
    };
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Property Types
export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "studio"
  | "penthouse"
  | "duplex"
  | "commercial";
export type PropertyCategory = "rent" | "sale";
export type PropertyStatus =
  | "available"
  | "rented"
  | "sold"
  | "pending"
  | "inactive";
export type Currency = "EGP" | "USD" | "EUR";
export type AreaUnit = "sqm" | "sqft";

export interface PropertyImage {
  publicId: string;
  url: string;
  alt: string;
  isMain: boolean;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  price: number;
  currency: Currency;
  area: {
    total: number;
    unit: AreaUnit;
  };
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  totalFloors?: number;
  location: {
    address: string;
    city: string;
    district?: string;
    state?: string;
    country: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: PropertyImage[];
  amenities: string[];
  features: Array<{
    name: string;
    value: string;
  }>;
  owner: User | string;
  agent?: User | string;
  status: PropertyStatus;
  isApproved: boolean;
  approvedBy?: User | string;
  approvedAt?: Date;
  rejectionReason?: string;
  views: number;
  favorites: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  availableFrom: Date;
  leaseDuration?: number;
  deposit?: number;
  downPayment?: number;
  utilities?: {
    included: boolean;
    cost?: number;
    details?: string;
  };
  rules?: {
    smoking: boolean;
    pets: boolean;
    parties: boolean;
    other?: string;
  };
  isActive: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
  count: number;
  total: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  language?: "en" | "ar";
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Search and Filter Types
export interface PropertyFilters {
  search?: string;
  type?: PropertyType;
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  amenities?: string[];
  sortBy?: "price" | "createdAt" | "views";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Form Types
export interface PropertyFormData {
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  price: number;
  currency: Currency;
  area: {
    total: number;
    unit: AreaUnit;
  };
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  totalFloors?: number;
  location: {
    address: string;
    city: string;
    district?: string;
    state?: string;
    country: string;
    zipCode?: string;
  };
  amenities: string[];
  features: Array<{
    name: string;
    value: string;
  }>;
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  availableFrom: Date;
  leaseDuration?: number;
  deposit?: number;
  utilities?: {
    included: boolean;
    cost?: number;
    details?: string;
  };
  rules?: {
    smoking: boolean;
    pets: boolean;
    parties: boolean;
    other?: string;
  };
}

// UI Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// State Management Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  userProperties: Property[];
  filters: PropertyFilters;
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Theme Types
export type Theme = "light" | "dark" | "system";

// Language Types
export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

// Agency Types
export interface Agency {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
}
