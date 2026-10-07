"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { propertyService } from "../../shared/services/propertyService";
import { useToast } from "../../shared/provider/ToastProvider";
import { useRouter } from "next/navigation";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  // Set when the last load failed, so the wishlist page can offer a retry instead of an empty list.
  const [loadError, setLoadError] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Load wishlist from backend when user logs in
  useEffect(() => {
    if (user && user._id) {
      loadWishlistFromBackend();
    } else {
      // Clear wishlist when user logs out
      setWishlist([]);
    }
  }, [user]);

  const loadWishlistFromBackend = async () => {
    if (!user || !user._id) return;

    setLoading(true);
    setLoadError(false);
    try {
      const wishlistData = await propertyService.getUserWishlist();
      const formattedWishlist = wishlistData.map(item => ({
        id: item.property._id,
        title: item.property.title,
        price: item.property.price,
        location: item.property.location,
        images: item.property.images,
        bedrooms: item.property.bedrooms,
        bathrooms: item.property.bathrooms,
        area: item.property.area,
        type: item.property.type,
        category: item.property.category,
        addedAt: item.addedAt
      }));
      setWishlist(formattedWishlist);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setLoadError(true);
      showToast('تعذر تحميل المفضلة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (property) => {
    if (!user || !user._id) {
      showToast('سجّل الدخول لتحفظ الإعلان في المفضلة', 'warning');
      setTimeout(() => {
        router.push('/login');
      }, 2000);



      return false;
    }

    try {
      await propertyService.addToWishlist(property.id || property._id);

      const propertyData = {
        id: property.id || property._id,
        title: property.title,
        price: property.price,
        location: property.location,
        images: property.images,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        type: property.type,
        category: property.category,
        addedAt: new Date()
      };

      setWishlist(prev =>
        prev.some(item => item.id === propertyData.id)
          ? prev
          : [...prev, propertyData]
      );

      showToast('أُضيف الإعلان إلى المفضلة.', 'success');
      return true;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        // The server only accepts approved, active listings; this one is pending, hidden or deleted.
        showToast('هذا الإعلان غير متاح الآن، فلا يمكن حفظه.', 'warning');
      } else if (status === 401) {
        showToast('انتهت جلستك. سجّل الدخول مرة أخرى لتحفظ الإعلان.', 'warning');
      } else {
        showToast('تعذر حفظ الإعلان في المفضلة.', 'error');
      }
      return false;
    }
  };

  const removeFromWishlist = async (propertyId) => {
    if (!user || !user._id) {
      showToast('سجّل الدخول لتعدّل المفضلة.', 'warning');
      return false;
    }

    try {
      await propertyService.removeFromWishlist(propertyId);
      setWishlist(prev => prev.filter(item => item.id !== propertyId));
      showToast('أُزيل الإعلان من المفضلة.', 'success');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('تعذر إزالة الإعلان من المفضلة.', 'error');
      return false;
    }
  };

  const removeAllFromWishlist = async () => {
    if (!user || !user._id) {
      showToast('سجّل الدخول لتعدّل المفضلة.', 'warning');
      return false;
    }

    try {
      await propertyService.clearWishlist();
      setWishlist([]);
      showToast('أُزيلت كل الإعلانات من المفضلة.', 'success');
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      showToast('تعذر إفراغ المفضلة.', 'error');
      return false;
    }
  };

  const isInWishlist = (propertyId) => {
    return wishlist.some(item => item.id === propertyId);
  };

  const getWishlistCount = () => wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        loadError,
        addToWishlist,
        removeFromWishlist,
        removeAllFromWishlist,
        isInWishlist,
        getWishlistCount,
        loadWishlistFromBackend
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
