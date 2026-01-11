import { apiClient } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./types";

export const authApi = {
  /**
   * Đăng nhập
   * @param credentials - Account và password
   * @returns Login response với token
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/user/login", credentials);
    const data = response.data as LoginResponse;
    
    // Normalize token: handle nested object format { token: { Token: "..." } }
    if (data.token && typeof data.token === "object" && "Token" in data.token) {
      data.token = data.token.Token as string;
    }
    
    return data;
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

  /**
   * Đăng ký tài khoản
   * @param data - Thông tin đăng ký
   * @returns Register response với token
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/user/register", data);
    const result = response.data as RegisterResponse;
    
    // Normalize token: handle nested object format { token: { Token: "..." } }
    if (result.token && typeof result.token === "object" && "Token" in result.token) {
      result.token = result.token.Token as string;
    }
    
    return result;
  },
};

