import { API_URL } from "@/lib/constants";
import type { ApiError, ApiResponse } from "./types";

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {};
    
    // Chỉ set Content-Type nếu không phải FormData (FormData sẽ tự set boundary)
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    // Get token from cookie if available (for client-side)
    if (typeof window !== "undefined") {
      const token = this.getTokenFromCookie();
      // Ensure token is a valid string before using it
      if (token && typeof token === "string" && token.trim() !== "" && token !== "[object Object]") {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Parse JSON response
      let data: Record<string, unknown>;
      try {
        data = (await response.json()) as Record<string, unknown>;
      } catch {
        // Nếu parse JSON fail, đọc text thay thế
        const text = await response.text();
        const apiError: ApiError = {
          message: text || "Invalid JSON response from server",
          status: response.status,
        };
        throw apiError;
      }

      // Check response status và error field trong body
      // Support multiple error formats:
      // Format 1: { error: "...", message: "..." } 
      // Format 2: { msg: "...", status_code: 401 }
      const statusCode = (data.status_code as number) || response.status;
      
      // Xử lý 401 Unauthorized - tự động refresh token
      // Tránh refresh token cho chính endpoint refresh token để tránh vòng lặp
      if (statusCode === 401 && retryCount === 0 && typeof window !== "undefined" && !endpoint.includes("/user/get_access_token")) {
        try {
          // Gọi refresh token
          await this.refreshToken();
          // Retry request với token mới
          return this.request<T>(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          // Nếu refresh fail, throw error
          const error: ApiError = {
            message: "Session expired. Please login again.",
            status: 401,
          };
          throw error;
        }
      }

      if (!response.ok || data.error || data.msg) {
        const error: ApiError = {
          message: (data.msg as string) || (data.error as string) || (data.message as string) || "An error occurred",
          status: statusCode,
          errors: data.errors as Record<string, string[]> | undefined,
        };
        throw error;
      }

      return {
        data: data as T,
        message: data.message as string | undefined,
        status: response.status,
      };
    } catch (error) {
      // Nếu đã là ApiError (có status), throw lại
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      
      // Xử lý network errors hoặc parsing errors
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
      throw apiError;
    }
  }

  private async refreshToken(): Promise<void> {
    // Tránh gọi refresh nhiều lần cùng lúc
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        // Dynamic import để tránh circular dependency
        const { useAuthStore } = await import("@/lib/stores");
        const { authApi } = await import("./auth");
        
        // Gọi API refresh token (không qua apiClient để tránh vòng lặp)
        // Gọi trực tiếp fetch để tránh interceptor
        const refreshTokenFromCookie = this.getRefreshTokenFromCookie();
        if (!refreshTokenFromCookie) {
          throw new Error("No refresh token available");
        }

        const refreshResponse = await fetch(`${this.baseURL}/user/get_access_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshTokenFromCookie }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh token");
        }

        const refreshData = await refreshResponse.json();
        
        // Parse response - format có thể là { data: { access_token, refresh_token } } hoặc { access_token, refresh_token }
        let newAccessToken: string | undefined;
        let newRefreshToken: string | undefined;

        if (refreshData && typeof refreshData === "object") {
          if (refreshData.data && typeof refreshData.data === "object") {
            // Format: { data: { access_token, refresh_token } }
            newAccessToken = refreshData.data.access_token || refreshData.data.token;
            newRefreshToken = refreshData.data.refresh_token || refreshData.data.refreshToken;
          } else {
            // Format: { access_token, refresh_token } hoặc { token, refreshToken }
            newAccessToken = refreshData.access_token || refreshData.token;
            newRefreshToken = refreshData.refresh_token || refreshData.refreshToken;
          }
        }

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        if (newAccessToken) {
          // Update token trong cookie
          document.cookie = `token=${newAccessToken}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
          
          // Update token trong store
          const authStore = useAuthStore.getState();
          authStore.setToken(newAccessToken);
        }

        if (newRefreshToken) {
          // Update refreshToken trong cookie
          document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        }
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private getTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("token=")
    );
    if (!tokenCookie) return null;
    // Use substring to get value after "token=", handle cases where value might contain "="
    const value = tokenCookie.trim().substring(6); // "token=".length = 6
    
    // Ensure value is a string and not empty
    if (!value || typeof value !== "string") return null;
    
    // Handle case where cookie might contain "[object Object]" - return null
    if (value === "[object Object]") return null;
    
    return value;
  }

  private getRefreshTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("refreshToken=")
    );
    if (!refreshTokenCookie) return null;
    const value = refreshTokenCookie.trim().substring(13); // "refreshToken=".length = 13
    return value || null;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    // Nếu body là FormData, không stringify và không set Content-Type
    const isFormData = body instanceof FormData;
    const requestBody = isFormData 
      ? body 
      : body 
        ? JSON.stringify(body) 
        : undefined;
    
    // Nếu body là FormData, không set Content-Type header (browser sẽ tự set với boundary)
    // Nếu options.headers có Content-Type, loại bỏ nó khi là FormData
    const customHeaders: HeadersInit = {};
    if (!isFormData) {
      customHeaders["Content-Type"] = "application/json";
    }
    
    // Merge headers: nếu là FormData, loại bỏ Content-Type từ options.headers
    const mergedHeaders: HeadersInit = { ...customHeaders };
    if (options?.headers) {
      const optionsHeaders = options.headers as HeadersInit;
      Object.keys(optionsHeaders).forEach((key) => {
        // Bỏ qua Content-Type nếu body là FormData
        if (isFormData && key.toLowerCase() === "content-type") {
          return;
        }
        mergedHeaders[key] = optionsHeaders[key];
      });
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: requestBody,
      headers: mergedHeaders,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

// Export singleton instance - gọi trực tiếp external API
export const apiClient = new ApiClient(API_URL);

