import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse } from "../api/types";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setToken: (token: string) => {
        // Set token vào cookie
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        set({ token, isAuthenticated: true });
      },

      setUser: (user: User) => {
        set({ user });
      },

      login: (token: string, user: User) => {
        // Set token vào cookie
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        // Xóa cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
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
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

