import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: number;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  role: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setUser: (user: User) => void;
  setRole: (role: number) => void;
  login: (token: string, refreshToken: string | null, user: User, role?: number) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setToken: (token: string) => {
        // Set token vào cookie
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        set({ token, isAuthenticated: true });
      },

      setRefreshToken: (refreshToken: string) => {
        // Set refreshToken vào cookie (KHÔNG lưu vào state để tránh localStorage)
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        // Không set vào state để tránh persist vào localStorage
      },

      setUser: (user: User) => {
        set({ user });
      },

      setRole: (role: number) => {
        // Set role vào cookie để middleware có thể đọc
        document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        set({ role });
      },

      login: (token: string, refreshToken: string | null, user: User, role?: number) => {
        // Set token vào cookie
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        if (refreshToken) {
          // Set refreshToken vào cookie (KHÔNG lưu vào state để tránh localStorage)
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        }
        if (role !== undefined) {
          document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        }
        set({
          token,
          // refreshToken không set vào state để tránh persist vào localStorage
          user: { ...user, role },
          role: role ?? null,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        // Xóa cookies
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        set({
          token: null,
          refreshToken: null,
          user: null,
          role: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAccessToken: async () => {
        // Đọc refreshToken từ cookie (không từ state để tránh localStorage)
        const refreshToken = getRefreshTokenFromCookie();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          // ⚠️ TẠM THỜI: Mock refresh token - xóa phần này khi có API thật
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Mock: Generate new token
          const newToken = "refreshed-token-" + Date.now();
          const newRefreshToken = "refresh-token-" + Date.now();
          
          // Set new tokens vào cookie
          document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
          document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
          
          // Chỉ set token vào state (không set refreshToken để tránh localStorage)
          set({
            token: newToken,
            isAuthenticated: true,
          });

          // ⚠️ CODE GỐC (gọi API thật) - uncomment khi có API:
          /*
          const response = await fetch(`${API_URL}/refresh-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          const data: RefreshTokenResponse = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to refresh token");
          }

          if (data.token) {
            document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
            set({ token: data.token, isAuthenticated: true });
          }

          if (data.refreshToken) {
            // Chỉ lưu refreshToken vào cookie, không vào state
            document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
          }
          */
        } catch (error) {
          // Nếu refresh token fail, logout user
          const state = useAuthStore.getState();
          state.logout();
          throw error;
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // CHỈ persist những thứ cần thiết, KHÔNG persist refreshToken để tránh localStorage
        token: state.token,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        // refreshToken KHÔNG được persist - chỉ lưu trong cookie
      }),
    }
  )
);

/**
 * Helper function để đọc refreshToken từ cookie
 * RefreshToken chỉ được lưu trong cookie, không lưu trong localStorage
 */
function getRefreshTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("refreshToken=")
  );
  if (!refreshTokenCookie) return null;
  const value = refreshTokenCookie.trim().substring(13); // "refreshToken=".length = 13
  return value || null;
}

