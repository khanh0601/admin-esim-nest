import { apiClient } from "./client";
import type { UserProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from "./types";

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
};

