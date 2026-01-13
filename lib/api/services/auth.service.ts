import { axiosClient } from "../axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  User,
  LoginCredentials,
  AuthResponse,
} from "@/types/auth.types";

export const authService = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post("/auth/logout");
  },

  me: async (): Promise<ApiResponse<User>> => {
    const { data } = await axiosClient.get<ApiResponse<User>>("/auth/me");
    return data;
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const { data } = await axiosClient.post<ApiResponse<{ token: string }>>(
      "/auth/refresh"
    );
    return data;
  },
};
