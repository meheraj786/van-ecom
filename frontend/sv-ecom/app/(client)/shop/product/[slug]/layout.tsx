import type { Metadata } from "next";
import {
  getPublicProduct,
  getPublicTheme,
  getSiteUrl,
  toAbsoluteUrl,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, theme] = await Promise.all([
    getPublicProduct(slug),
    getPublicTheme(),
  ]);
  const seo = theme?.seo;
  const title = product?.name || seo?.metaTitle || "Product";
  const description =
    product?.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    seo?.metaDescription ||
    "View product details and shop online.";
  const image = toAbsoluteUrl(
    product?.baseImage || seo?.ogImage || theme?.logo,
  );
  const url = getSiteUrl(`/shop/product/${encodeURIComponent(slug)}`);

  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
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

export default function ProductLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
