"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/useThemeStore";

export default function DynamicFavicon() {
  const pathname = usePathname();
  const { data: theme } = useTheme();
  const storeTheme = useThemeStore((state) => state.theme);

  const faviconUrl = theme?.favicon || storeTheme?.favicon;

  React.useEffect(() => {
    if (!faviconUrl || typeof window === "undefined") return;

    const applyFavicon = () => {
      const relTypes = ["icon", "shortcut icon", "apple-touch-icon"];

      relTypes.forEach((rel) => {
        let link: HTMLLinkElement | null = document.querySelector(
          `link[rel='${rel}']`,
        );

        if (!link) {
          link = document.createElement("link");
          link.rel = rel;
          document.head.appendChild(link);
        }

        link.href = faviconUrl;
      });
    };

    applyFavicon();

    const timeout = setTimeout(applyFavicon, 100);
    return () => clearTimeout(timeout);
  }, [faviconUrl, pathname]);

  return null;
}
