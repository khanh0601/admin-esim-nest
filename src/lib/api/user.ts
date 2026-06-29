import { apiClient } from "./client";
import type { UserProfile, UserProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from "./types";

export const userApi = {
  /**
   * Get user profile
   * @returns User profile data
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>("/user/profile");
    return response.data as UserProfileResponse;
  },

  /**
   * Update user profile
   * @param data - Profile update data (callback URLs)
   * @returns Updated profile data
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await apiClient.patch<UpdateProfileResponse>("/user/update", data);
    return response.data as UpdateProfileResponse;
  },

  /**
   * Lấy danh sách tất cả người dùng (dành cho Admin)
   * @returns Response với danh sách tất cả người dùng
   */
  listAllUsers: async (): Promise<{ data?: UserProfile[]; message?: string; error?: string }> => {
    const response = await apiClient.get<{ data?: UserProfile[]; message?: string; error?: string }>("/user/list_all_user");
    return response.data ?? {};
  },

  /**
   * Khóa tài khoản người dùng
   * @param userId - ID người dùng cần khóa
   */
  lockUser: async (userId: number): Promise<{ data?: boolean; message?: string; error?: string }> => {
    const response = await apiClient.patch<{ data?: boolean; message?: string; error?: string }>(`/user/locked_user?userId=${userId}`);
    return response.data ?? {};
  },

  /**
   * Mở khóa tài khoản người dùng
   * @param userId - ID người dùng cần mở khóa
   */
  unlockUser: async (userId: number): Promise<{ data?: boolean; message?: string; error?: string }> => {
    const response = await apiClient.patch<{ data?: boolean; message?: string; error?: string }>(`/user/unlocked_user?userId=${userId}`);
    return response.data ?? {};
  },
};

