import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Vendor, type User, authService } from "@/services/authService";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  vendor: Vendor | null;
  isAuthenticated: boolean;
  isAuthenticatedVendor: boolean;
  isLoading: boolean;
  loginUser: (user: User) => void;
  loginVendor: (vendor: Vendor) => void;
  logoutUser: () => Promise<void>;
  logoutVendor: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      vendor: null,
      isAuthenticated: false,
      isAuthenticatedVendor: false,
      isLoading: false,

      loginUser: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      loginVendor: (vendor) => {
        set({
          vendor,
          isAuthenticatedVendor: true,
          isLoading: false,
        });
      },

      logoutUser: async () => {
        try {
          await authService.logout();
        } catch {
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logoutVendor: async () => {
        try {
          await authService.logout();
        } catch {
        } finally {
          set({
            vendor: null,
            isAuthenticatedVendor: false,
            isLoading: false,
          });
        }
      },

      initialize: async () => {
        try {
          const response = await api.get<any>("/auth/me");
          const payload = response?.data;
          const currentUser = payload?.user || (payload?.id ? payload : null);

          if (currentUser && currentUser.id) {
            set({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "lumina_auth_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        vendor: state.vendor,
        isAuthenticated: state.isAuthenticated,
        isAuthenticatedVendor: state.isAuthenticatedVendor,
      }),
    },
  ),
);
