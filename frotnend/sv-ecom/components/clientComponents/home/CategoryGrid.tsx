"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

interface CategoryBlockProps {
  block: {
    layout: number;
    catOrsubCatIds: string[];
    max?: number;
  };
  blockIndex: number;
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800";

function useResolvedCategoryItems(
  block: { catOrsubCatIds: string[] },
  blockIndex: number,
) {
  const { data: categoriesResponse } = useCategories(1, 100);
  const res = categoriesResponse as any;
  const categoryData =
    res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
  const categories = Array.isArray(categoryData) ? categoryData : [];

  return React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        image: string;
        isSub: boolean;
        parentSlug?: string;
      }
    >();

    categories.forEach((cat: any) => {
      const catSlug = cat.slug || cat.id;
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: catSlug,
        image: cat.image || "",
        isSub: false,
      });

      if (cat.subCategories && Array.isArray(cat.subCategories)) {
        cat.subCategories.forEach((sub: any) => {
          map.set(sub.id, {
            id: sub.id,
            name: sub.name,
            slug: sub.slug || sub.id,
            image: sub.image || cat.image || "",
            isSub: true,
            parentSlug: catSlug,
          });
        });
      }
    });

    const selectedIds = block.catOrsubCatIds || [];
    let items: Array<{
      id: string;
      name: string;
      slug: string;
      image: string;
      isSub: boolean;
      parentSlug?: string;
    }> = [];

    if (selectedIds?.length > 0) {
      items = selectedIds.map((id) => map.get(id)).filter(Boolean) as Array<{
        id: string;
        name: string;
        slug: string;
        image: string;
        isSub: boolean;
        parentSlug?: string;
      }>;
    } else {
      const offset = blockIndex * 4;
      items = categories.slice(offset, offset + 4).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug || c.id,
        image: c.image || "",
        isSub: false,
      }));
    }

    return items.slice(0, 4);
  }, [categories, block, blockIndex]);
}

const getItemHref = (item: {
  slug: string;
  isSub: boolean;
  parentSlug?: string;
}) => {
  if (item.isSub && item.parentSlug) {
    return `/shop?category=${encodeURIComponent(
      item.parentSlug,
    )}&subCategory=${encodeURIComponent(item.slug)}&page=1`;
  }
  return `/shop?category=${encodeURIComponent(item.slug)}&page=1`;
};

export function CategoryGrid1({ block, blockIndex }: CategoryBlockProps) {
  const items = useResolvedCategoryItems(block, blockIndex);

  if (items?.length === 0) return null;

  return (
    <section className="py-14 md:py-20 max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
            Department #{blockIndex + 1}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            Shop By Category
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-blue-600 flex items-center gap-1"
        >
          <span>View All</span> <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <Link
            key={item.id}
            href={getItemHref(item)}
            className="group relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 p-6 flex flex-col justify-end hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500"
          >
            <Image
              src={item.image || DEFAULT_FALLBACK_IMAGE}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="relative z-10 text-white space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">
                0{idx + 1}
              </span>
              <h3 className="text-lg sm:text-xl font-bold leading-tight">
                {item.name}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/90 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid2({ block, blockIndex }: CategoryBlockProps) {
  const items = useResolvedCategoryItems(block, blockIndex);

  if (items?.length === 0) return null;

  return (
    <section className="py-14 md:py-20 max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
            Department #{blockIndex + 1}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            Curated Categories
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={getItemHref(item)}
            className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 p-8 flex flex-col justify-end hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500"
          >
            <Image
              src={item.image || DEFAULT_FALLBACK_IMAGE}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative z-10 text-white space-y-1">
              <h3 className="text-2xl font-black">{item.name}</h3>
              <span className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-1.5">
                Shop Collection <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid3({ block, blockIndex }: CategoryBlockProps) {
  const items = useResolvedCategoryItems(block, blockIndex);

  if (items?.length === 0) return null;

  return (
    <section className="py-14 md:py-20 max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
            Department #{blockIndex + 1}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            Browse Selection
          </h2>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Link
            key={item.id}
            href={getItemHref(item)}
            className="relative shrink-0 w-[75%] sm:w-[42%] lg:w-[23.5%] aspect-[3/4] rounded-3xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 snap-start bg-gray-50 border border-gray-100"
          >
            <Image
              src={item.image || DEFAULT_FALLBACK_IMAGE}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <h3 className="text-xl font-bold">{item.name}</h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                Explore &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function CategoryGrid() {
  const { data: theme } = useTheme();
  const rawBlocks = theme?.shopByCategoryOrSubcategory || [];
  const blocks = Array.isArray(rawBlocks) ? rawBlocks : [];

  if (blocks?.length === 0) return null;

  return (
    <>
      {blocks.map((block, idx) => {
        if (block.layout === 2) {
          return <CategoryGrid2 key={idx} block={block} blockIndex={idx} />;
        }
        if (block.layout === 3) {
          return <CategoryGrid3 key={idx} block={block} blockIndex={idx} />;
        }
        return <CategoryGrid1 key={idx} block={block} blockIndex={idx} />;
      })}
    </>
  );
}
