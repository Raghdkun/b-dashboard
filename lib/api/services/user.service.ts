import { axiosClient } from "../axios-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { User, UpdateUserPayload } from "@/types/user.types";

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const userService = {
  getUsers: async (
    params?: GetUsersParams
  ): Promise<PaginatedResponse<User>> => {
    const { data } = await axiosClient.get<PaginatedResponse<User>>("/users", {
      params,
    });
    return data;
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await axiosClient.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  updateUser: async (
    id: string,
    userData: UpdateUserPayload
  ): Promise<ApiResponse<User>> => {
    const { data } = await axiosClient.patch<ApiResponse<User>>(
      `/users/${id}`,
      userData
    );
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },
};
