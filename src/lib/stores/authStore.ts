import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_URL } from "@/lib/constants";
import type { RefreshTokenResponse } from "../api/types";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setUser: (user: User) => void;
  login: (token: string, refreshToken: string | null, user: User) => void;
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
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setToken: (token: string) => {
        // Set token vào cookie
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        set({ token, isAuthenticated: true });
      },

      setRefreshToken: (refreshToken: string) => {
        // Set refreshToken vào cookie
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        set({ refreshToken });
      },

      setUser: (user: User) => {
        set({ user });
      },

      login: (token: string, refreshToken: string | null, user: User) => {
        // Set token vào cookie
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        if (refreshToken) {
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        }
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        // Xóa cookies
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAccessToken: async () => {
        const state = useAuthStore.getState();
        if (!state.refreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          // ⚠️ TẠM THỜI: Mock refresh token - xóa phần này khi có API thật
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Mock: Generate new token
          const newToken = "refreshed-token-" + Date.now();
          const newRefreshToken = "refresh-token-" + Date.now();
          
          // Set new tokens
          document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
          document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
          
          set({
            token: newToken,
            refreshToken: newRefreshToken,
          });

          // ⚠️ CODE GỐC (gọi API thật) - uncomment khi có API:
          /*
          const response = await fetch(`${API_URL}/refresh-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: state.refreshToken }),
          });

          const data: RefreshTokenResponse = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to refresh token");
          }

          if (data.token) {
            document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
            set({ token: data.token });
          }

          if (data.refreshToken) {
            document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
            set({ refreshToken: data.refreshToken });
          }
          */
        } catch (error) {
          // Nếu refresh token fail, logout user
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
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

