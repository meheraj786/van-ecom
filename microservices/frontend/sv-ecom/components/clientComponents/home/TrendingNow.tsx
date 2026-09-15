"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import {
  ProductCard1,
  ProductCard2,
  ProductCard3,
} from "@/components/clientComponents/product/ProductCard";

interface ProductSectionProps {
  section: {
    layout: number;
    catOrSubcatOrmenu: string;
    max: number;
  };
  sectionIndex: number;
}

const DynamicProductCard = ({ product }: { product: any }) => {
  const { data: theme } = useTheme();
  const cardLayout = (theme as any)?.product?.cardLayout || 1;

  if (cardLayout === 2) return <ProductCard2 product={product} />;
  if (cardLayout === 3) return <ProductCard3 product={product} />;
  return <ProductCard1 product={product} />;
};

function useSectionProducts(target: string, maxItems: number) {
  const { data: productsResponse } = useProducts({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useCategories(1, 100);

  const prodRes = productsResponse as any;
  const productData = prodRes?.data?.items || prodRes?.items || [];
  const allProducts = Array.isArray(productData) ? productData : [];

  const catRes = categoriesResponse as any;
  const categoryData =
    catRes?.data?.items ||
    catRes?.items ||
    (Array.isArray(catRes) ? catRes : []);
  const categories = Array.isArray(categoryData) ? categoryData : [];

  const filterKey = (target || "").toLowerCase().trim();

  const filtered = React.useMemo(() => {
    if (!filterKey) return allProducts;

    if (filterKey.includes("new")) {
      return allProducts.filter((p: any) => p.isNew);
    }
    if (filterKey.includes("feature")) {
      return allProducts.filter((p: any) => p.isFeatured);
    }
    if (filterKey.includes("best")) {
      return allProducts.filter((p: any) => p.isBestSeller);
    }

    return allProducts.filter(
      (p: any) =>
        p.categories?.some(
          (c: any) =>
            c.category?.name?.toLowerCase() === filterKey ||
            c.category?.slug?.toLowerCase() === filterKey ||
            c.name?.toLowerCase() === filterKey ||
            c.slug?.toLowerCase() === filterKey,
        ) ||
        p.subCategories?.some(
          (s: any) =>
            s.subCategory?.name?.toLowerCase() === filterKey ||
            s.subCategory?.slug?.toLowerCase() === filterKey ||
            s.name?.toLowerCase() === filterKey,
        ) ||
        p.name?.toLowerCase().includes(filterKey),
    );
  }, [allProducts, filterKey]);

  const viewAllHref = React.useMemo(() => {
    if (!filterKey) return "/shop";

    if (filterKey.includes("new")) return "/shop?isNew=true&page=1";
    if (filterKey.includes("feature")) return "/shop?isFeatured=true&page=1";
    if (filterKey.includes("best")) return "/shop?isBestSeller=true&page=1";

    const matchedCat = categories.find(
      (c: any) =>
        c.name?.toLowerCase() === filterKey ||
        c.slug?.toLowerCase() === filterKey,
    );

    if (matchedCat) {
      return `/shop?category=${encodeURIComponent(
        matchedCat.slug || matchedCat.id,
      )}&page=1`;
    }

    for (const cat of categories) {
      if (cat.subCategories && Array.isArray(cat.subCategories)) {
        const matchedSub = cat.subCategories.find(
          (s: any) =>
            s.name?.toLowerCase() === filterKey ||
            s.slug?.toLowerCase() === filterKey,
        );
        if (matchedSub) {
          return `/shop?category=${encodeURIComponent(
            cat.slug || cat.id,
          )}&subCategory=${encodeURIComponent(
            matchedSub.slug || matchedSub.id,
          )}&page=1`;
        }
      }
    }

    return `/shop?category=${encodeURIComponent(filterKey)}&page=1`;
  }, [filterKey, categories]);

  const items = (filtered?.length > 0 ? filtered : allProducts).slice(
    0,
    maxItems || 8,
  );

  return { items, viewAllHref };
}

export function TrendingNow1({ section }: ProductSectionProps) {
  const { items, viewAllHref } = useSectionProducts(
    section.catOrSubcatOrmenu,
    section.max || 8,
  );
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  if (items?.length === 0) return null;

  return (
    <section className="py-16 md:py-20 max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
            Curated Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            {section.catOrSubcatOrmenu || "Trending Now"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={viewAllHref}
            className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-gray-900 hidden sm:inline-flex items-center gap-1"
          >
            View All <ArrowUpRight size={14} />
          </Link>
          <div className="flex space-x-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product: any) => (
          <div
            key={product.id}
            className="w-[260px] sm:w-[290px] shrink-0 snap-start"
          >
            <DynamicProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrendingNow2({ section }: ProductSectionProps) {
  const { items, viewAllHref } = useSectionProducts(
    section.catOrSubcatOrmenu,
    section.max || 8,
  );
  const sideScrollerRef = React.useRef<HTMLDivElement>(null);

  if (items?.length === 0) return null;

  const [featured, ...rest] = items;
  const isLargeSet = rest?.length > 4;

  return (
    <section className="py-16 md:py-20 max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 border-t border-gray-100">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
            Editorial Split
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            {section.catOrSubcatOrmenu || "Top Highlights"}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-blue-600 flex items-center gap-1"
        >
          <span>View All</span> <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {featured && (
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <DynamicProductCard product={featured} />
          </div>
        )}

        <div className="lg:col-span-2">
          {isLargeSet ? (
            <div
              ref={sideScrollerRef}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[750px] overflow-y-auto pr-1"
            >
              {rest.map((product: any) => (
                <DynamicProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {rest.map((product: any) => (
                <DynamicProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function TrendingNow3({ section }: ProductSectionProps) {
  const { items, viewAllHref } = useSectionProducts(
    section.catOrSubcatOrmenu,
    section.max || 8,
  );
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  if (items?.length === 0) return null;

  const isCarouselView = items?.length > 4;

  return (
    <section className="py-16 md:py-20 max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 border-t border-gray-100">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
            Catalog Grid
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            {section.catOrSubcatOrmenu || "Curated Products"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={viewAllHref}
            className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-blue-600 flex items-center gap-1"
          >
            <span>View All</span> <ArrowUpRight size={14} />
          </Link>

          {isCarouselView && (
            <div className="flex space-x-1.5">
              <button
                type="button"
                onClick={() => scrollByAmount(-1)}
                className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount(1)}
                className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isCarouselView ? (
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((product: any) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[290px] shrink-0 snap-start"
            >
              <DynamicProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product: any) => (
            <DynamicProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export function ProductShowcase() {
  const { data: theme } = useTheme();
  const productSections = Array.isArray(theme?.productBy)
    ? theme.productBy
    : [];

  return (
    <>
      {productSections.map((section, idx) => {
        if (section.layout === 2) {
          return (
            <TrendingNow2 key={idx} section={section} sectionIndex={idx} />
          );
        }
        if (section.layout === 3) {
          return (
            <TrendingNow3 key={idx} section={section} sectionIndex={idx} />
          );
        }
        return <TrendingNow1 key={idx} section={section} sectionIndex={idx} />;
      })}
    </>
  );
}
