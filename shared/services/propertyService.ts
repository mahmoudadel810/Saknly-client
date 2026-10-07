import { Property, PropertyFilters, PaginatedResponse } from '../types';
import { api as apiClient } from './api';

export const propertyService = {
  // Search properties
  searchProperties: async (filters: PropertyFilters): Promise<PaginatedResponse<Property>> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.sortBy) params.append('sort', filters.sortBy);
    if (filters.sortOrder) params.append('order', filters.sortOrder === 'asc' ? '1' : '-1');
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/properties/search?${params.toString()}`);
    return response.data;
  },

  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    const response = await apiClient.get('/properties/featured');
    return response.data.data;
  },

  // Add property to wishlist
  addToWishlist: async (propertyId: string): Promise<void> => {
    await apiClient.post(`/properties/${propertyId}/favorite`);
  },

  // Remove property from wishlist
  removeFromWishlist: async (propertyId: string): Promise<void> => {
    await apiClient.delete(`/properties/${propertyId}/favorite`);
  },

  // Check if property is in wishlist
  checkWishlistStatus: async (propertyId: string): Promise<{ isFavorite: boolean }> => {
    const response = await apiClient.get(`/properties/${propertyId}/favorite`);
    return response.data.data;
  },

  // Get user wishlist
  getUserWishlist: async (): Promise<any[]> => {
    const response = await apiClient.get('/users/me/wishlist');
    return response.data.data;
  },

  // Clear user wishlist
  clearWishlist: async (): Promise<void> => {
    await apiClient.delete('/users/me/wishlist');
  }
};

export default propertyService; 