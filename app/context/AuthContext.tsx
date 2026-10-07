// context/AuthContext.tsx
"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_URL, authHeader, clearAuthToken, getToken, setAuthToken } from "@/shared/utils/auth";

// Define the User type
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: 'user' | 'admin';
  isConfirmed: boolean;
  isLoggedIn: boolean;
  avatar?: { url: string };
  phone?: string;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  setSession: (token: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Loads the current user for the stored token. An invalid or rejected token clears
  // both the cookie and localStorage; a network failure keeps the token for a later retry.
  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/auth/getMe`, { headers: authHeader(token) });
      const fetched = res.data?.data?.user;
      if (res.data?.success && fetched && fetched.isLoggedIn !== false) {
        setUser(fetched);
      } else {
        clearAuthToken();
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      if (axios.isAxiosError(error) && error.response) {
        clearAuthToken();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSession = useCallback(async (token: string) => {
    setAuthToken(token);
    await fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    await setSession(res.data.token);
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      const token = getToken();
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true, headers: authHeader(token) });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthToken();
      setUser(null);
      router.push('/');
    }
  }, [router]);

  // Check the stored token once on mount (not on every navigation).
  useEffect(() => {
    const token = getToken();
    // Older sessions only stored the token in localStorage; mirror it into the cookie
    // so the middleware route guards see it.
    if (token && !Cookies.get("token")) {
      setAuthToken(token);
    } else if (!token && Cookies.get("token")) {
      clearAuthToken();
    }
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, fetchUser, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
