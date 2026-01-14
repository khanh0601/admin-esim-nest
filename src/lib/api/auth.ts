import { apiClient } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./types";

export const authApi = {
  /**
   * Đăng nhập
   * @param credentials - Account và password
   * @returns Login response với token
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ data?: { access_token?: string; refresh_token?: string; user?: { id: number; email: string; role: number } } }>("/user/login", credentials);
    
    // API trả về format: { data: { access_token, refresh_token, user } }
    const apiData = response.data?.data;
    
    if (!apiData) {
      return {
        error: "Invalid response format from server",
      };
    }

    // Map API response sang LoginResponse format
    const loginResponse: LoginResponse = {
      token: apiData.access_token,
      refreshToken: apiData.refresh_token,
      role: apiData.user?.role,
      user: apiData.user ? {
        id: String(apiData.user.id), // Convert number to string
        email: apiData.user.email,
      } : undefined,
    };
    
    return loginResponse;
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
    // Thay đổi endpoint ở đây: "/refresh-token" → endpoint của bạn
    const response = await apiClient.post("/user/get_access_token");
    return response.data;
  },

  /**
   * Đăng ký tài khoản
   * @param data - Thông tin đăng ký
   * @returns Register response với token
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/user/create_user", data);
    const result = response.data as RegisterResponse;
    return result;
  },
};

