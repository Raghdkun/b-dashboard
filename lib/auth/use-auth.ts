"use client";

import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "./auth.store";
import type { LoginCredentials } from "@/types/auth.types";

export function useAuth() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    login: storeLogin,
    logout: storeLogout,
    checkAuth,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await storeLogin(credentials);
      router.push(`/${locale}/dashboard`);
    },
    [storeLogin, router, locale]
  );

  const logout = useCallback(() => {
    storeLogout();
    router.push(`/${locale}/auth/login`);
  }, [storeLogout, router, locale]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    checkAuth,
  };
}
