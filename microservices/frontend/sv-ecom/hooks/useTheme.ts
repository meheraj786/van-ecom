import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { themeService, type ThemeConfig } from "@/services/themeService";
import { useThemeStore } from "@/store/useThemeStore";

export function useTheme() {
  return useQuery({
    queryKey: ["app-theme"],
    queryFn: () => themeService.getTheme(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor);

  return useMutation({
    mutationFn: (payload: Partial<ThemeConfig>) =>
      themeService.updateTheme(payload),
    onSuccess: (updatedData: ThemeConfig) => {
      queryClient.invalidateQueries({ queryKey: ["app-theme"] });
      if (updatedData.primaryColor && setPrimaryColor) {
        setPrimaryColor(updatedData.primaryColor);
      }
    },
  });
}

export function useResetTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => themeService.resetTheme(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-theme"] });
    },
  });
}
