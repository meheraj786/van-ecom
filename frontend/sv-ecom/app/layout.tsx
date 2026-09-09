import "@/app/globals.css";
import type { Metadata } from "next";
import DynamicFavicon from "@/components/DynamicFavicon";
import {
  getPublicTheme,
  getSiteUrl,
  siteMetadataBase,
  toAbsoluteUrl,
} from "@/lib/seo";
import { Providers } from "./providers";

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getPublicTheme();
  const seo = theme?.seo;
  const title = seo?.metaTitle || "Online Store";
  const description =
    seo?.metaDescription || "Shop our latest products online.";
  const image = toAbsoluteUrl(seo?.ogImage || theme?.logo || theme?.favicon);
  const canonical = seo?.canonicalUrl || getSiteUrl();

  return {
    metadataBase: siteMetadataBase,
    title,
    description,
    keywords: seo?.keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    icons: theme?.favicon ? { icon: toAbsoluteUrl(theme.favicon) } : undefined,
    openGraph: {
      type: "website",
      url: canonical,
      siteName: title,
      title,
      description,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <head>
        <DynamicFavicon />
      </head> */}
      <body>
        <Providers>
          <DynamicFavicon />
          {children}
        </Providers>
      </body>
    </html>
  );
}
