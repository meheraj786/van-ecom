import type { ThemeConfig } from "@/services/themeService";
import type { Product } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost";

export const siteMetadataBase = new URL(siteUrl);

function unwrap<T>(payload: T | { data?: T }): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload.data ?? payload) as T;
  }
  return payload as T;
}

async function getPublicJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return unwrap<T>(await response.json());
  } catch {
    return null;
  }
}

export function toAbsoluteUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, siteMetadataBase).toString();
  } catch {
    return undefined;
  }
}

export function getSiteUrl(path = "/"): string {
  return new URL(path, siteMetadataBase).toString();
}

export async function getPublicTheme(): Promise<ThemeConfig | null> {
  return getPublicJson<ThemeConfig>("/theme");
}

export async function getPublicProduct(slug: string): Promise<Product | null> {
  return getPublicJson<Product>(`/product/${encodeURIComponent(slug)}`);
}
