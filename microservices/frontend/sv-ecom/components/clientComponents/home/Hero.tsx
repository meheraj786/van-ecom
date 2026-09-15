"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard1 as ProductCard } from "@/components/clientComponents/product/ProductCard";
import { useThemeStore } from "@/store/useThemeStore";

export function Hero1() {
  const { data: theme } = useTheme();
  const { primaryColor } = useThemeStore();
  const banner = theme?.banner;

  const targetLink = banner?.categoryId
    ? `/shop?categoryId=${banner.categoryId}`
    : "/shop";

  return (
    <section
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="relative pt-32 md:pt-36 pb-0 bg-[#f8f9fb] overflow-hidden border-b border-gray-100"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col items-center text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="secondary"
            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white border shadow-xs"
          >
            <Sparkles size={12} className="mr-1.5 text-amber-500" /> Curated
            Artifacts
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif leading-[1.08] text-gray-900 max-w-4xl tracking-tight"
        >
          {banner?.slogan || "Elevate Your Everyday."}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed font-medium"
        >
          {banner?.paragraph ||
            "Curated lifestyle pieces designed with enduring quality, refined aesthetics, and timeless utility."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-4 pt-2"
        >
          <Link href={targetLink}>
            <Button className="h-13 px-8 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-white hover:bg-gray-800 shadow-xl shadow-gray-200">
              Explore Collection <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="relative mt-12 w-full h-[380px] sm:h-[480px] md:h-[560px] max-w-[1440px] mx-auto px-6 md:px-12"
      >
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-200/80">
          <Image
            src={
              banner?.bgImg?.[0] ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600"
            }
            alt="Hero Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

export function Hero2() {
  const { data: theme } = useTheme();
  const { primaryColor } = useThemeStore();
  const { data: categoriesResponse } = useCategories(1, 100);
  const banner = theme?.banner;

  const catRes = categoriesResponse as any;
  const categoryData =
    catRes?.data?.items ||
    catRes?.items ||
    (Array.isArray(catRes) ? catRes : []);
  const categories = Array.isArray(categoryData) ? categoryData : [];
  const targetCategory = categories.find(
    (c: any) => c.id === banner?.categoryId,
  );
  const { data: allCategories } = useCategories(1, 10000);
  const categorySlug = allCategories?.data?.items?.find(
    (c: any) => c.id === banner?.categoryId,
  )?.slug;

  const targetLink = categorySlug
    ? `/shop?category=${categorySlug}&page=1`
    : "/shop";

  return (
    <section
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="relative min-h-[85vh] pt-32 md:pt-20 flex items-center overflow-hidden bg-[#f8f9fb] border-b border-gray-100"
    >
      <div className="absolute inset-y-0 right-0 w-full md:w-[55%]">
        <div className="relative w-full h-full">
          <Image
            src={
              targetCategory?.image ||
              banner?.bgImg?.[0] ||
              "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=1200"
            }
            alt="Featured Category"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9fb] via-[#f8f9fb]/20 to-transparent" />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl bg-white/95 backdrop-blur-md md:bg-transparent rounded-3xl p-8 md:p-0 space-y-6 shadow-xl md:shadow-none border md:border-none border-gray-100"
        >
          <Badge
            variant="secondary"
            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white border shadow-xs"
          >
            Featured Category Spotlight
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-serif leading-tight text-gray-900">
            {targetCategory?.name ? (
              <>
                The {targetCategory.name} <br />
                <span className="italic font-light">Edition.</span>
              </>
            ) : (
              banner?.slogan || "Elevate Your Everyday"
            )}
          </h1>

          <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium max-w-md">
            {banner?.paragraph ||
              "Explore curated pieces made with precision engineering, clean silhouettes, and pure performance."}
          </p>

          <div className="pt-2">
            <Link href={targetLink}>
              <Button className="h-13 px-8 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-white hover:bg-gray-800 shadow-xl shadow-gray-200">
                Shop {targetCategory?.name || "Category"} Now{" "}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Hero3() {
  const { data: theme } = useTheme();
  const { primaryColor } = useThemeStore();
  const { data: productsResponse } = useProducts({ page: 1, limit: 100 });
  const banner = theme?.banner;

  const prodRes = productsResponse as any;
  const productData =
    prodRes?.data?.items ||
    prodRes?.items ||
    (Array.isArray(prodRes) ? prodRes : []);
  const products = Array.isArray(productData) ? productData : [];
  const selectedProductIds = Array.isArray(banner?.productId)
    ? banner.productId
    : [];
  const featuredProducts = products
    .filter((p: any) => selectedProductIds.includes(p.id))
    .slice(0, 3);

  return (
    <section
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="relative pt-36 md:pt-32 pb-20 bg-[#f8f9fb] overflow-hidden border-b border-gray-100"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white border shadow-xs"
            >
              Handpicked Essentials
            </Badge>

            <h1 className="text-5xl sm:text-7xl font-serif leading-[0.98] text-gray-900 tracking-tight">
              {banner?.slogan || "Engineered for Style."}
            </h1>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              {banner?.paragraph ||
                "Discover modern classics crafted for longevity and effortless performance."}
            </p>
            <Link href="/shop">
              <Button className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-xs bg-gray-900 text-white hover:bg-gray-800">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        </div>

        {featuredProducts?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-200/80">
            {featuredProducts.map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Hero() {
  const { data: theme } = useTheme();
  const layout = theme?.banner?.layout || 1;

  if (layout === 2) {
    return <Hero2 />;
  }

  if (layout === 3) {
    return <Hero3 />;
  }

  return <Hero1 />;
}
