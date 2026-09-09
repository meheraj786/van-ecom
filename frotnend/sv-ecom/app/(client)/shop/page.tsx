"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useStocks } from "@/hooks/useInventory";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/clientComponents/product/ProductCard";
import { Category } from "@/types";

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";

const NEW_ARRIVAL_BANNER =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200";

const BEST_SELLER_BANNER =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200";

const FEATURED_BANNER =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200";

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: themeData } = useTheme();
  const primaryColor = themeData?.primaryColor || "#111827";

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = 9;

  const selectedCategorySlug =
    searchParams.get("category") ||
    searchParams.get("categorySlug") ||
    searchParams.get("categoryId") ||
    "";

  const selectedSubCategorySlug =
    searchParams.get("subCategory") ||
    searchParams.get("subCategorySlug") ||
    searchParams.get("subCategoryId") ||
    "";

  const minPriceParam = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : 0;
  const maxPriceParam = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : 10000;
  const isNewParam = searchParams.get("isNew") === "true";
  const isBestSellerParam = searchParams.get("isBestSeller") === "true";
  const isFeaturedParam = searchParams.get("isFeatured") === "true";
  const inStockParam = searchParams.get("inStock") === "true";
  const sortByParam = searchParams.get("sortBy") || "newest";
  const optionFilter = searchParams.get("option") || "";
  const optionValueFilter = searchParams.get("optionValue") || "";

  const [priceSlider, setPriceSlider] = React.useState<number[]>([
    minPriceParam,
    maxPriceParam,
  ]);

  const [categorySearch, setCategorySearch] = React.useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [expandedOptionGroups, setExpandedOptionGroups] = React.useState<
    Set<string>
  >(new Set());
  const OPTION_VALUES_PREVIEW_COUNT = 10;
  const CATEGORY_SEARCH_THRESHOLD = 8;

  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories(1, 100);
  const { data: allCatalogResponse } = useProducts({ page: 1, limit: 100 });
  const { data: allStocksData } = useStocks({ page: 1, limit: 100 });

  const catRes = categoriesResponse as any;
  const categories: any[] =
    catRes?.data?.items ||
    catRes?.items ||
    catRes?.data?.categories ||
    (Array.isArray(catRes) ? catRes : []);

  const selectedCategoryObj = categories.find(
    (c: any) =>
      c.slug === selectedCategorySlug || c.id === selectedCategorySlug,
  );
  const subCategories = selectedCategoryObj?.subCategories || [];

  const selectedSubCategoryObj = subCategories.find(
    (s: any) =>
      s.slug === selectedSubCategorySlug || s.id === selectedSubCategorySlug,
  );

  const bannerDetails = React.useMemo(() => {
    if (selectedSubCategoryObj) {
      return {
        image: selectedSubCategoryObj.image || DEFAULT_BANNER,
        title: selectedSubCategoryObj.name,
        subtitle: "Explore dynamic product configurations & styles",
        badge: "Subcategory collection",
      };
    }

    if (selectedCategoryObj) {
      return {
        image: selectedCategoryObj.image || DEFAULT_BANNER,
        title: selectedCategoryObj.name,
        subtitle: "Explore dynamic product configurations & styles",
        badge: "Category catalogue",
      };
    }

    if (isNewParam) {
      return {
        image: themeData?.newPage?.bgImg || NEW_ARRIVAL_BANNER,
        title: themeData?.newPage?.title || "New Arrivals",
        subtitle:
          themeData?.newPage?.slogan ||
          "Discover the latest additions to our curated catalogue",
        badge: (themeData?.newPage as any)?.badge || "New releases",
      };
    }

    if (isBestSellerParam) {
      return {
        image: themeData?.bestPage?.bgImg || BEST_SELLER_BANNER,
        title: themeData?.bestPage?.title || "Best Sellers",
        subtitle:
          themeData?.bestPage?.slogan ||
          "Most loved and trending pieces by our community",
        badge: (themeData?.bestPage as any)?.badge || "Top rated",
      };
    }

    if (isFeaturedParam) {
      return {
        image: themeData?.featuredPage?.bgImg || FEATURED_BANNER,
        title: themeData?.featuredPage?.title || "Featured Selections",
        subtitle:
          themeData?.featuredPage?.slogan ||
          "Hand-picked essentials curated with precision",
        badge: (themeData?.featuredPage as any)?.badge || "Editor's choice",
      };
    }

    return {
      image: DEFAULT_BANNER,
      title: "Curated collection",
      subtitle: "Explore dynamic product configurations & styles",
      badge: "Official catalogue",
    };
  }, [
    selectedSubCategoryObj,
    selectedCategoryObj,
    isNewParam,
    isBestSellerParam,
    isFeaturedParam,
    themeData,
  ]);

  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    page: currentPage,
    limit: pageSize,
    categoryId: selectedCategoryObj?.id || undefined,
    subCategoryId: selectedSubCategoryObj?.id || undefined,
    isNew: isNewParam || undefined,
    isBestSeller: isBestSellerParam || undefined,
    isFeatured: isFeaturedParam || undefined,
    option: optionFilter || undefined,
    optionValue: optionValueFilter || undefined,
    sortBy: sortByParam as any,
  });

  const prodRes = productsResponse as any;
  const rawProducts = prodRes?.data?.items || prodRes?.items || [];

  const catalogRes = allCatalogResponse as any;
  const allCatalogProducts: any[] =
    catalogRes?.data?.items || catalogRes?.items || [];

  const allStocksList = React.useMemo(() => {
    const stocksRes = allStocksData as any;
    return stocksRes?.data?.stocks || stocksRes?.stocks || [];
  }, [allStocksData]);

  const inStockVariantIds = React.useMemo(() => {
    return new Set(
      allStocksList
        .filter((s: any) => s.quantityRemaining > 0)
        .map((s: any) => s.variantId),
    );
  }, [allStocksList]);

  const filteredProducts = React.useMemo(() => {
    let list = rawProducts;

    if (inStockParam && allStocksList?.length > 0) {
      list = list.filter((prod: any) =>
        prod.variants?.some((v: any) => inStockVariantIds.has(v.id)),
      );
    }

    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) {
      list = list.filter((prod: any) => {
        const prodVariantIds = new Set(
          (prod.variants || []).map((v: any) => v.id),
        );
        const activeStocks = allStocksList.filter(
          (s: any) =>
            prodVariantIds.has(s.variantId) && s.quantityRemaining > 0,
        );

        if (!activeStocks?.length) return true;
        const prices = activeStocks.map((s: any) => s.sellingPrice);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        return min <= maxPriceParam && max >= minPriceParam;
      });
    }

    return list;
  }, [
    rawProducts,
    inStockParam,
    allStocksList,
    inStockVariantIds,
    minPriceParam,
    maxPriceParam,
    searchParams,
  ]);

  const meta = productsResponse?.meta ||
    (productsResponse as any)?.data?.meta || {
      total: filteredProducts?.length,
      totalPages: 1,
      page: 1,
      limit: pageSize,
    };

  const dynamicFilterOptions = React.useMemo(() => {
    const optionsMap: Record<string, Set<string>> = {};

    allCatalogProducts.forEach((prod: any) => {
      prod.productOptions?.forEach((opt: any) => {
        const optName = opt.name;
        if (!optionsMap[optName]) {
          optionsMap[optName] = new Set<string>();
        }
        opt.productOptionValues?.forEach((val: any) => {
          optionsMap[optName].add(val.value);
        });
      });
    });

    return Object.entries(optionsMap).map(([name, valuesSet]) => ({
      name,
      values: Array.from(valuesSet),
    }));
  }, [allCatalogProducts]);

  const updateQueryParams = (
    newParams: Record<string, string | number | boolean | null | undefined>,
  ) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === false
      ) {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage });
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setPriceSlider([0, 10000]);
    router.push(pathname, { scroll: false });
  };

  const visibleCategories = React.useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.trim().toLowerCase();
    return categories.filter((cat: Category) =>
      cat.name?.toLowerCase().includes(q),
    );
  }, [categories, categorySearch]);

  const toggleOptionGroupExpanded = (groupName: string) => {
    setExpandedOptionGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const hasActiveFilters =
    !!selectedCategorySlug ||
    !!selectedSubCategorySlug ||
    isNewParam ||
    isBestSellerParam ||
    isFeaturedParam ||
    inStockParam ||
    !!optionFilter ||
    !!searchParams.get("minPrice") ||
    !!searchParams.get("maxPrice");

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="bg-[#FBFAF8] min-h-screen pt-10"
    >
      <div className="border-b border-neutral-200/70">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex items-center text-sm text-neutral-500">
          <Link
            href="/"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Home
          </Link>
          <ChevronRight size={13} className="mx-2 text-neutral-300" />
          <Link
            href="/shop"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Collections
          </Link>
          {selectedCategoryObj && (
            <>
              <ChevronRight size={13} className="mx-2 text-neutral-300" />
              <span className="text-neutral-900 font-medium">
                {selectedCategoryObj.name}
              </span>
            </>
          )}
          {selectedSubCategoryObj && (
            <>
              <ChevronRight size={13} className="mx-2 text-neutral-300" />
              <span className="text-neutral-900 font-medium">
                {selectedSubCategoryObj.name}
              </span>
            </>
          )}
          {!selectedCategoryObj && isNewParam && (
            <>
              <ChevronRight size={13} className="mx-2 text-neutral-300" />
              <span className="text-neutral-900 font-medium">New Arrivals</span>
            </>
          )}
          {!selectedCategoryObj && isBestSellerParam && (
            <>
              <ChevronRight size={13} className="mx-2 text-neutral-300" />
              <span className="text-neutral-900 font-medium">Best Sellers</span>
            </>
          )}
          {!selectedCategoryObj && isFeaturedParam && (
            <>
              <ChevronRight size={13} className="mx-2 text-neutral-300" />
              <span className="text-neutral-900 font-medium">Featured</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-[2rem] mb-12 bg-neutral-100">
          <Image
            src={bannerDetails.image}
            alt={bannerDetails.title}
            fill
            className="object-cover transition-all duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-10 text-white max-w-2xl">
            <Badge className="bg-white/15 backdrop-blur-md text-white border-none font-medium text-[11px] mb-3">
              {bannerDetails.badge}
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
              {bannerDetails.title}
            </h1>
            <p className="text-sm text-white/80 mt-2 line-clamp-2">
              {bannerDetails.subtitle}
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between lg:hidden">
          <p className="text-sm text-neutral-500">
            {filteredProducts?.length} products
          </p>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:border-neutral-400"
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] text-white">
                !
              </span>
            )}
          </button>
        </div>

        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-hidden="true"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        <div className="flex flex-col md:pt-0 pt-20 lg:flex-row gap-10">
          <aside
            className={cn(
              "w-full lg:w-[280px] shrink-0",
              "max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:overflow-y-auto max-lg:bg-[#FBFAF8] max-lg:p-5 max-lg:pt-16",
              !mobileFiltersOpen && "max-lg:hidden",
            )}
          >
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute right-5 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 lg:hidden"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={16}
                      style={{ color: "var(--primary)" }}
                    />
                    <h3 className="font-semibold text-base text-neutral-900">
                      Filters
                    </h3>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-xs text-neutral-500 hover:text-[var(--primary)] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 space-y-4">
                <h4 className="text-sm font-medium text-neutral-900">
                  Categories
                </h4>
                {categoriesLoading ? (
                  <p className="text-sm text-neutral-400">
                    Loading categories…
                  </p>
                ) : (
                  <>
                    {categories?.length > CATEGORY_SEARCH_THRESHOLD && (
                      <input
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search categories"
                        className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-full px-3.5 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      />
                    )}
                    <div
                      className={cn(
                        "space-y-1",
                        categories?.length > CATEGORY_SEARCH_THRESHOLD &&
                          "max-h-64 overflow-y-auto pr-1",
                      )}
                    >
                      {visibleCategories?.length === 0 ? (
                        <p className="text-sm text-neutral-400 px-2.5 py-1">
                          No categories match &quot;{categorySearch}&quot;
                        </p>
                      ) : (
                        visibleCategories.map((cat: Category) => {
                          const catSlug = cat.slug || cat.id;
                          const isChecked = selectedCategorySlug === catSlug;
                          return (
                            <label
                              key={cat.id || cat.slug}
                              htmlFor={cat.slug || cat.id}
                              className={cn(
                                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer transition-colors",
                                isChecked
                                  ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                                  : "hover:bg-neutral-50 text-neutral-600",
                              )}
                            >
                              <Checkbox
                                id={cat.slug || cat.id}
                                checked={isChecked}
                                onCheckedChange={() => {
                                  updateQueryParams({
                                    category: isChecked ? null : catSlug,
                                    subCategory: null,
                                    page: 1,
                                  });
                                }}
                                className="border-neutral-300 data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:text-white"
                              />
                              <span
                                className={cn(
                                  "text-sm transition-colors",
                                  isChecked
                                    ? "font-semibold text-[var(--primary)]"
                                    : "text-neutral-600",
                                )}
                              >
                                {cat.name}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </>
                )}

                {selectedCategorySlug && subCategories?.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-neutral-100 space-y-1">
                    <h4 className="text-xs font-medium text-neutral-500 mb-2 px-2.5">
                      Subcategory
                    </h4>
                    <div
                      className={cn(
                        "space-y-1",
                        subCategories?.length > CATEGORY_SEARCH_THRESHOLD &&
                          "max-h-56 overflow-y-auto pr-1",
                      )}
                    >
                      {subCategories.map((sub: any) => {
                        const subSlug = sub.slug || sub.id;
                        const isChecked = selectedSubCategorySlug === subSlug;
                        return (
                          <label
                            key={sub.id || sub.slug}
                            htmlFor={sub.slug || sub.id}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer transition-colors",
                              isChecked
                                ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                                : "hover:bg-neutral-50 text-neutral-600",
                            )}
                          >
                            <Checkbox
                              id={sub.slug || sub.id}
                              checked={isChecked}
                              onCheckedChange={() => {
                                updateQueryParams({
                                  subCategory: isChecked ? null : subSlug,
                                  page: 1,
                                });
                              }}
                              className="border-neutral-300 data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:text-white"
                            />
                            <span
                              className={cn(
                                "text-sm transition-colors",
                                isChecked
                                  ? "font-semibold text-[var(--primary)]"
                                  : "text-neutral-600",
                              )}
                            >
                              {sub.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 space-y-3">
                <h4 className="text-sm font-medium text-neutral-900">
                  Collections
                </h4>
                <div className="space-y-1">
                  <label
                    htmlFor="isNew"
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer transition-colors",
                      isNewParam
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                        : "hover:bg-neutral-50 text-neutral-600",
                    )}
                  >
                    <Checkbox
                      id="isNew"
                      checked={isNewParam}
                      onCheckedChange={(val) =>
                        updateQueryParams({ isNew: val ? true : null, page: 1 })
                      }
                      className="border-neutral-300 data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:text-white"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isNewParam
                          ? "font-semibold text-[var(--primary)]"
                          : "text-neutral-600",
                      )}
                    >
                      New arrivals
                    </span>
                  </label>

                  <label
                    htmlFor="isBestSeller"
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer transition-colors",
                      isBestSellerParam
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                        : "hover:bg-neutral-50 text-neutral-600",
                    )}
                  >
                    <Checkbox
                      id="isBestSeller"
                      checked={isBestSellerParam}
                      onCheckedChange={(val) =>
                        updateQueryParams({
                          isBestSeller: val ? true : null,
                          page: 1,
                        })
                      }
                      className="border-neutral-300 data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:text-white"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isBestSellerParam
                          ? "font-semibold text-[var(--primary)]"
                          : "text-neutral-600",
                      )}
                    >
                      Best sellers
                    </span>
                  </label>

                  <label
                    htmlFor="isFeatured"
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer transition-colors",
                      isFeaturedParam
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                        : "hover:bg-neutral-50 text-neutral-600",
                    )}
                  >
                    <Checkbox
                      id="isFeatured"
                      checked={isFeaturedParam}
                      onCheckedChange={(val) =>
                        updateQueryParams({
                          isFeatured: val ? true : null,
                          page: 1,
                        })
                      }
                      className="border-neutral-300 data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:text-white"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isFeaturedParam
                          ? "font-semibold text-[var(--primary)]"
                          : "text-neutral-600",
                      )}
                    >
                      Featured selections
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 space-y-5">
                <h4 className="text-sm font-medium text-neutral-900">
                  Price range
                </h4>
                <div className="px-1">
                  <Slider
                    value={priceSlider}
                    onValueChange={(val) => setPriceSlider(val)}
                    onValueCommit={(val) =>
                      updateQueryParams({
                        minPrice: val[0] > 0 ? val[0] : null,
                        maxPrice: val[1] < 10000 ? val[1] : null,
                        page: 1,
                      })
                    }
                    max={10000}
                    step={50}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm font-medium text-neutral-700">
                  <span>৳{priceSlider[0]}</span>
                  <span>৳{priceSlider[1]}+</span>
                </div>
              </div>

              {dynamicFilterOptions?.length > 0 && (
                <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 space-y-5">
                  {dynamicFilterOptions.map((optGroup, idx) => (
                    <div
                      key={optGroup.name}
                      className={cn(
                        "space-y-2.5",
                        idx > 0 && "pt-5 border-t border-neutral-100",
                      )}
                    >
                      <h4 className="text-sm font-medium text-neutral-900">
                        {optGroup.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(expandedOptionGroups.has(optGroup.name)
                          ? optGroup.values
                          : optGroup.values.slice(
                              0,
                              OPTION_VALUES_PREVIEW_COUNT,
                            )
                        ).map((val) => {
                          const isSelected =
                            optionFilter.toLowerCase() ===
                              optGroup.name.toLowerCase() &&
                            optionValueFilter.toLowerCase() ===
                              val.toLowerCase();

                          return (
                            <button
                              type="button"
                              key={val}
                              onClick={() =>
                                updateQueryParams({
                                  option: isSelected ? null : optGroup.name,
                                  optionValue: isSelected ? null : val,
                                  page: 1,
                                })
                              }
                              className={cn(
                                "px-3 py-1.5 rounded-full border text-xs font-medium capitalize transition-all cursor-pointer",
                                isSelected
                                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs"
                                  : "border-neutral-200 text-neutral-600 hover:border-[var(--primary)] hover:text-[var(--primary)] bg-white",
                              )}
                            >
                              {val}
                            </button>
                          );
                        })}
                        {optGroup.values?.length >
                          OPTION_VALUES_PREVIEW_COUNT && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleOptionGroupExpanded(optGroup.name)
                            }
                            className="px-3 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-[var(--primary)] transition-colors cursor-pointer"
                          >
                            {expandedOptionGroups.has(optGroup.name)
                              ? "Show less"
                              : `+${
                                  optGroup.values?.length -
                                  OPTION_VALUES_PREVIEW_COUNT
                                } more`}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-900">
                  In stock only
                </h4>
                <Switch
                  checked={inStockParam}
                  onCheckedChange={(val) =>
                    updateQueryParams({ inStock: val ? true : null, page: 1 })
                  }
                  className="data-[state=checked]:bg-[var(--primary)]"
                />
              </div>
            </div>
          </aside>

          <main className="flex-1 space-y-8">
            <div className="flex items-center justify-between border-b border-neutral-200/70 pb-6">
              <p className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-900">
                  {filteredProducts?.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-neutral-900">
                  {meta.total}
                </span>{" "}
                products
              </p>

              <Select
                value={sortByParam}
                onValueChange={(val) =>
                  updateQueryParams({ sortBy: val, page: 1 })
                }
              >
                <SelectTrigger className="w-[190px] rounded-full border-neutral-200 font-medium text-sm">
                  <span className="text-neutral-400 mr-1 text-xs">Sort:</span>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl">
                  <SelectItem value="newest" className="font-medium">
                    Newest arrivals
                  </SelectItem>
                  <SelectItem value="oldest" className="font-medium">
                    Oldest first
                  </SelectItem>
                  <SelectItem value="name-asc" className="font-medium">
                    Name: A to Z
                  </SelectItem>
                  <SelectItem value="name-desc" className="font-medium">
                    Name: Z to A
                  </SelectItem>
                  <SelectItem value="rating-high" className="font-medium">
                    Highest rated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {productsLoading ? (
              <div className="flex h-[45vh] items-center justify-center">
                <Loader2 className="animate-spin text-neutral-300" size={30} />
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="border border-dashed border-neutral-200 rounded-[2rem] p-16 text-center space-y-3 bg-white">
                <p className="text-neutral-900 font-semibold text-lg">
                  No products found
                </p>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Try clearing your filters or changing your search criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="rounded-full font-medium mt-2 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {meta.totalPages > 1 && (
              <div className="pt-8 border-t border-neutral-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-neutral-500">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => handlePageChange(meta.page - 1)}
                    className="rounded-full h-10 px-4 font-medium gap-1"
                  >
                    <ChevronLeft size={16} /> Prev
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === meta.totalPages ||
                          Math.abs(p - meta.page) <= 1,
                      )
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && (
                              <span className="px-2 text-sm text-neutral-400">
                                ...
                              </span>
                            )}
                            <Button
                              variant={meta.page === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(p)}
                              style={
                                meta.page === p
                                  ? {
                                      backgroundColor: "var(--primary)",
                                      color: "#ffffff",
                                    }
                                  : undefined
                              }
                              className={cn(
                                "rounded-full h-10 w-10 p-0 font-medium text-sm transition-colors",
                                meta.page === p
                                  ? "border-transparent"
                                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
                              )}
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => handlePageChange(meta.page + 1)}
                    className="rounded-full h-10 px-4 font-medium gap-1"
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBFAF8]">
          <Loader2 className="animate-spin text-neutral-400" size={32} />
        </div>
      }
    >
      <ShopContent />
    </React.Suspense>
  );
}
