import Cookies from "js-cookie";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://saknly-server-9air.vercel.app/api/saknly/v1";

// The server expects exactly `Authorization: Saknly__<jwt>` (no space, no "Bearer").
export const AUTH_PREFIX = process.env.NEXT_PUBLIC_TOKEN_PREFIX ?? "Saknly__";

const TOKEN_KEY = "token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const authHeader = (token: string | null = getToken()): Record<string, string> =>
  token ? { Authorization: `${AUTH_PREFIX}${token}` } : {};

// Persists the token for client requests (localStorage) and for middleware route guards (cookie).
export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  Cookies.set(TOKEN_KEY, token, {
    path: "/",
    sameSite: "lax",
    secure: window.location.protocol === "https:",
    expires: 5,
  });
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  Cookies.remove(TOKEN_KEY, { path: "/" });
};
