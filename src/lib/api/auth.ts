import { apiClient } from "./client";
import type { LoginRequest, LoginResponse } from "./types";

export const authApi = {
  /**
   * Đăng nhập
   * @param credentials - Email và password
   * @returns Login response với token
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/login", credentials);
    return response.data as LoginResponse;
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      // Ignore logout errors
      console.error("Logout error:", error);
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: async () => {
    const response = await apiClient.get("/me");
    return response.data;
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    const response = await apiClient.post("/refresh-token");
    return response.data;
  },
};

