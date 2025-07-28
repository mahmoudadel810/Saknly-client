// context/AuthContext.tsx
"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useRef } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const justLoggedIn = useRef(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/auth/login`, {
      email,
      password,
    });
    Cookies.set("token", res.data.token);
    localStorage.setItem("token", res.data.token);

    setUser(res.data.user);
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/auth/getMe`, {
          headers: {
            Authorization: `Saknly__${token}`,
          },
        });
        if (res.data.success && res.data.data?.user) {
          setUser(res.data.data.user);
          justLoggedIn.current = true;
        } else {
          logout();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        logout();
      }
    }
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/auth/logout`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Saknly__${token}`,
            },
          }
        );
      }
      console.log("Logout successful");
      router.push('/');

    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    const checkLoggedInUser = async () => {
      if (justLoggedIn.current) {
        justLoggedIn.current = false;
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/auth/getMe`, {
            headers: {
              Authorization: `Saknly__${token}`,
            },
          });
          if (res.data.success && res.data.data?.user?.isLoggedIn) {
            const userData = res.data.data.user;
            setUser(userData);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Failed to check user:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkLoggedInUser();
  }, [usePathname()]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, fetchUser }}>
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
