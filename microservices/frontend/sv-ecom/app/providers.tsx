"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/useThemeStore";

function hexToRgb(hex: string) {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex?.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 17, g: 24, b: 39 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getContrastColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 150 ? "#111827" : "#FFFFFF";
}

function DynamicThemeSync({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = React.useState(false);
  const {
    data: themeData,
    isLoading: isThemeLoading,
    isError: isThemeError,
  } = useTheme();
  const storePrimaryColor = useThemeStore((state) => state.primaryColor);
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor);

  const activeColor = themeData?.primaryColor || storePrimaryColor || "#111827";

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (
      themeData?.primaryColor &&
      themeData.primaryColor !== storePrimaryColor
    ) {
      setPrimaryColor(themeData.primaryColor);
    }
  }, [themeData?.primaryColor, storePrimaryColor, setPrimaryColor]);

  React.useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    const { r, g, b } = hexToRgb(activeColor);
    const contrastText = getContrastColor(activeColor);

    const secondaryShade = `rgba(${r}, ${g}, ${b}, 0.08)`;
    const secondaryHoverShade = `rgba(${r}, ${g}, ${b}, 0.14)`;
    const primaryHover = `rgba(${r}, ${g}, ${b}, 0.88)`;

    const root = document.documentElement;

    root.style.setProperty("--primary", activeColor);
    root.style.setProperty("--primary-foreground", contrastText);
    root.style.setProperty("--primary-hover", primaryHover);

    root.style.setProperty("--secondary", secondaryShade);
    root.style.setProperty("--secondary-hover", secondaryHoverShade);
    root.style.setProperty("--secondary-foreground", activeColor);

    root.style.setProperty("--ring", activeColor);
    root.style.setProperty("--sidebar-primary", activeColor);
  }, [activeColor, isMounted]);

  if (isThemeLoading && !themeData && !isThemeError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
          Loading storefront...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicThemeSync>{children}</DynamicThemeSync>
    </QueryClientProvider>
  );
}
