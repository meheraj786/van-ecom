import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ThemeConfig } from "@/services/themeService";

interface ThemeState {
  primaryColor: string;
  theme: ThemeConfig | null;
  setPrimaryColor: (color: string) => void;
  setTheme: (theme: ThemeConfig) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryColor: "#111827",
      theme: null,
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      setTheme: (theme) =>
        set({
          theme,
          primaryColor: theme?.primaryColor || "#111827",
        }),
    }),
    {
      name: "lumina_theme_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
    },
  ),
);
