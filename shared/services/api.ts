import axios from "axios";
import { API_URL, authHeader, clearAuthToken } from "@/shared/utils/auth";

// The base URL is defined once, in shared/utils/auth.ts (which this module needs for the auth header).
export { API_URL };

/**
 * The one HTTP client for the Saknly API: base URL, the `Saknly__` auth header, and 401 handling.
 * No default Content-Type: axios picks JSON for objects and multipart for FormData.
 */
export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const { Authorization } = authHeader();
    if (Authorization) config.headers.Authorization = Authorization;
  }
  return config;
});

// Auth endpoints answer 401 for wrong credentials or a stale token on getMe; their callers handle it.
const isAuthEndpoint = (url?: string) => !!url && url.includes("/auth/");

let redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isAuthEndpoint(error.config?.url) &&
      typeof window !== "undefined"
    ) {
      clearAuthToken();
      const { pathname, search } = window.location;
      if (!redirectingToLogin && !pathname.startsWith("/login")) {
        redirectingToLogin = true;
        // `redirect` is the parameter the login page and middleware already use.
        window.location.assign(`/login?redirect=${encodeURIComponent(pathname + search)}`);
      }
    }
    return Promise.reject(error);
  },
);

/**
 * A message that is safe to show: the server's own message for a client error (4xx), otherwise the
 * caller's Arabic fallback (network failures, 5xx, non-HTTP errors).
 */
export function getErrorMessage(err: unknown, fallbackArabic: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const message = (err.response?.data as { message?: unknown } | undefined)?.message;
    if (status !== undefined && status < 500 && typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallbackArabic;
}
