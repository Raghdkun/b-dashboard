import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getCSRFToken, getCSRFHeaderName } from "@/lib/security/csrf";
import { logSecurityEvent } from "@/lib/security/audit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  // Don't send cookies - we use Bearer token auth
  withCredentials: false,
});

// Request interceptor - attach token and CSRF
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      // Add CSRF token for mutating requests
      if (
        config.method &&
        ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())
      ) {
        const csrfToken = getCSRFToken();
        if (csrfToken && config.headers) {
          config.headers[getCSRFHeaderName()] = csrfToken;
        }
      }

      // Get auth token from localStorage
      // NOTE: In production, prefer httpOnly cookies set by the server
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // Log security-relevant errors
    if (status === 401) {
      logSecurityEvent("auth_failure", "medium", "Unauthorized request", {
        url: error.config?.url,
        method: error.config?.method,
      });

      // Clear auth state and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes("/auth")) {
          // Extract locale from current path or use default
          const pathParts = window.location.pathname.split("/").filter(Boolean);
          const possibleLocale = pathParts[0];
          const supportedLocales = ["en", "ar"];
          const locale = supportedLocales.includes(possibleLocale)
            ? possibleLocale
            : "en";
          window.location.href = `/${locale}/auth/login`;
        }
      }
    } else if (status === 403) {
      logSecurityEvent("unauthorized_access", "high", "Forbidden request", {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else if (status === 429) {
      logSecurityEvent("rate_limit", "medium", "Rate limit exceeded", {
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
