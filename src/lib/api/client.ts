import { API_URL } from "@/lib/constants";
import type { ApiError, ApiResponse } from "./types";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Get token from cookie if available (for client-side)
    if (typeof window !== "undefined") {
      const token = this.getTokenFromCookie();
      if (token) {
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
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        // Nếu parse JSON fail, đọc text thay thế
        const text = await response.text();
        const apiError: ApiError = {
          message: text || "Invalid JSON response from server",
          status: response.status,
        };
        throw apiError;
      }

      // Check response status và error field trong body
      if (!response.ok || data.error) {
        const error: ApiError = {
          message: data.error || data.message || "An error occurred",
          status: response.status,
          errors: data.errors,
        };
        throw error;
      }

      return {
        data: data as T,
        message: data.message,
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

  private getTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("token=")
    );
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
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

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Export singleton instance - gọi trực tiếp external API
export const apiClient = new ApiClient(API_URL);

