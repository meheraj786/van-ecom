"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { useProductBySlug } from "@/hooks/useProducts";
import { useVariantStockSummary, useStocks } from "@/hooks/useInventory";
import { useAddToCart } from "@/hooks/useCart";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/hooks/useTheme";
import {
  useProductReviews,
  useCreateProductReview,
  useDeleteProductReview,
} from "@/hooks/useReviews";
import ProductZoom from "@/components/clientComponents/product/ProductZoom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

interface GalleryImageItem {
  url: string;
  variantId?: string;
  optionsMap?: Record<string, string>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: themeData } = useTheme();
  const storePrimaryColor = useThemeStore((state) => state.primaryColor);
  const primaryColor =
    themeData?.primaryColor || storePrimaryColor || "#111827";

  const { user, isAuthenticated } = useAuthStore();

  const { data: productResponse, isLoading: productLoading } =
    useProductBySlug(slug);
  const addToCartMutation = useAddToCart();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const product = productResponse;
  const productId = product?.id || "";

  const isFavorite = isInWishlist(productId);

  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, string>
  >({});
  const [activeImage, setActiveImage] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [addedSuccess, setAddedSuccess] = React.useState<boolean>(false);

  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewComment, setReviewComment] = React.useState<string>("");
  const [reviewError, setReviewError] = React.useState<string>("");

  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(
    productId,
    1,
    20,
  );
  const createReviewMutation = useCreateProductReview(productId);
  const deleteReviewMutation = useDeleteProductReview(productId);

  const reviewsList = reviewsData?.reviews || [];
  const totalReviewsCount = reviewsData?.meta?.totalReviews || 0;

  const options = React.useMemo(() => product?.productOptions || [], [product]);
  const variants = React.useMemo(() => product?.variants || [], [product]);

  const { data: stocksData } = useStocks({ page: 1, limit: 100 });

  const allStocksList = React.useMemo(() => {
    return stocksData?.data?.stocks || stocksData?.stocks || [];
  }, [stocksData]);

  const inStockVariantIdSet = React.useMemo(() => {
    return new Set(
      allStocksList
        .filter((s: any) => (Number(s.quantityRemaining) || 0) > 0)
        .map((s: any) => s.variantId),
    );
  }, [allStocksList]);

  const getNormalizedVariantMap = React.useCallback(
    (variant: any): Record<string, string> => {
      const map: Record<string, string> = {};
      variant?.productVariantValues?.forEach((pvv: any) => {
        const optName = (
          pvv.optionValue?.option?.name ||
          pvv.option?.name ||
          ""
        )
          .trim()
          .toLowerCase();
        const optVal = (pvv.optionValue?.value || pvv.value || "")
          .trim()
          .toLowerCase();
        if (optName && optVal) {
          map[optName] = optVal;
        }
      });
      return map;
    },
    [],
  );

  React.useEffect(() => {
    if (variants?.length > 0 && options?.length > 0) {
      const inStockVariant =
        variants.find((v: any) => inStockVariantIdSet.has(v.id)) || variants[0];

      const initialSelection: Record<string, string> = {};
      options.forEach((opt: any) => {
        const optClean = opt.name.trim().toLowerCase();
        const vMap = getNormalizedVariantMap(inStockVariant);
        const match = opt.productOptionValues?.find(
          (val: any) => val.value.trim().toLowerCase() === vMap[optClean],
        );
        if (match) {
          initialSelection[opt.name] = match.value;
        } else if (opt.productOptionValues?.[0]) {
          initialSelection[opt.name] = opt.productOptionValues[0].value;
        }
      });

      setSelectedOptions(initialSelection);
    }
  }, [variants, options, inStockVariantIdSet, getNormalizedVariantMap]);

  const selectedVariant = React.useMemo(() => {
    if (!variants?.length) return null;
    if (!options?.length) return variants[0];

    const currentNormalized: Record<string, string> = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      currentNormalized[k.trim().toLowerCase()] = v.trim().toLowerCase();
    });

    return (
      variants.find((v: any) => {
        const vMap = getNormalizedVariantMap(v);
        return Object.entries(currentNormalized).every(
          ([optName, optVal]) => vMap[optName] === optVal,
        );
      }) || variants[0]
    );
  }, [variants, options, selectedOptions, getNormalizedVariantMap]);

  const { data: stockSummaryResponse, isLoading: stockLoading } =
    useVariantStockSummary(selectedVariant?.id);

  const stockSummary: any =
    (stockSummaryResponse as any)?.data || stockSummaryResponse;

  const totalStock = React.useMemo(() => {
    if (stockSummary?.totalStock > 0) return stockSummary.totalStock;
    const directMatch = allStocksList.find(
      (s: any) => s.variantId === selectedVariant?.id,
    );
    return directMatch?.quantityRemaining || 0;
  }, [stockSummary, allStocksList, selectedVariant]);

  const currentSellingPrice = React.useMemo(() => {
    if (stockSummary?.currentSellingPrice > 0)
      return stockSummary.currentSellingPrice;
    const directMatch = allStocksList.find(
      (s: any) => s.variantId === selectedVariant?.id,
    );
    return directMatch?.sellingPrice || 0;
  }, [stockSummary, allStocksList, selectedVariant]);

  const currentBeforeDiscount = React.useMemo(() => {
    const directMatch = allStocksList.find(
      (s: any) => s.variantId === selectedVariant?.id,
    );
    return directMatch?.isDiscounted && directMatch?.beforeDiscount
      ? Number(directMatch.beforeDiscount)
      : null;
  }, [allStocksList, selectedVariant]);

  const discountPercentage = React.useMemo(() => {
    if (currentBeforeDiscount && currentBeforeDiscount > currentSellingPrice) {
      return Math.round(
        ((currentBeforeDiscount - currentSellingPrice) /
          currentBeforeDiscount) *
          100,
      );
    }
    return 0;
  }, [currentBeforeDiscount, currentSellingPrice]);

  React.useEffect(() => {
    if (selectedVariant?.images?.[0]) {
      setActiveImage(selectedVariant.images[0]);
    } else if (product?.baseImage) {
      setActiveImage(product.baseImage);
    }
  }, [selectedVariant, product]);

  const galleryImages: GalleryImageItem[] = React.useMemo(() => {
    const list: GalleryImageItem[] = [];
    const addedUrls = new Set<string>();

    if (product?.baseImage) {
      list.push({ url: product.baseImage });
      addedUrls.add(product.baseImage);
    }

    variants.forEach((v: any) => {
      const vOptions: Record<string, string> = {};
      v.productVariantValues?.forEach((pvv: any) => {
        const optName = pvv.optionValue?.option?.name;
        const optVal = pvv.optionValue?.value;
        if (optName && optVal) vOptions[optName] = optVal;
      });

      v.images?.forEach((imgUrl: string) => {
        if (!addedUrls.has(imgUrl)) {
          list.push({
            url: imgUrl,
            variantId: v.id,
            optionsMap: vOptions,
          });
          addedUrls.add(imgUrl);
        }
      });
    });

    if (list?.length === 0) {
      list.push({
        url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800",
      });
    }

    return list;
  }, [product, variants]);

  const handleThumbnailClick = (item: GalleryImageItem) => {
    setActiveImage(item.url);
    if (item.optionsMap && Object.keys(item.optionsMap)?.length > 0) {
      setSelectedOptions(item.optionsMap);
      setQuantity(1);
    }
  };

  const handleToggleWishlist = () => {
    if (!product?.id) return;
    toggleItem({
      id: product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      price: currentSellingPrice,
      image: activeImage || displayImageFallback,
      options: selectedOptions,
    });
  };

  const displayImageFallback =
    selectedVariant?.images?.[0] ||
    product?.baseImage ||
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800";

  const isDirectlyCompatible = (optionName: string, value: string): boolean => {
    const cleanOpt = optionName.trim().toLowerCase();
    const cleanVal = value.trim().toLowerCase();

    const currentNormalized: Record<string, string> = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      currentNormalized[k.trim().toLowerCase()] = v.trim().toLowerCase();
    });

    const hypothetical = { ...currentNormalized, [cleanOpt]: cleanVal };

    return variants.some((v: any) => {
      const vMap = getNormalizedVariantMap(v);
      const isMatch = Object.entries(hypothetical).every(
        ([key, val]) => vMap[key] === val,
      );
      return isMatch && inStockVariantIdSet.has(v.id);
    });
  };

  const handleOptionSelect = (targetOptName: string, targetVal: string) => {
    const cleanOptName = targetOptName.trim().toLowerCase();
    const cleanVal = targetVal.trim().toLowerCase();

    const currentNormalized: Record<string, string> = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      currentNormalized[k.trim().toLowerCase()] = v.trim().toLowerCase();
    });

    const hypothetical = { ...currentNormalized, [cleanOptName]: cleanVal };

    const directInStockMatch = variants.find((v: any) => {
      const vMap = getNormalizedVariantMap(v);
      const matches = Object.entries(hypothetical).every(
        ([k, val]) => vMap[k] === val,
      );
      return matches && inStockVariantIdSet.has(v.id);
    });

    if (directInStockMatch) {
      setSelectedOptions((prev) => ({
        ...prev,
        [targetOptName]: targetVal,
      }));
      setQuantity(1);
      return;
    }

    const matchingCandidates = variants.filter((v: any) => {
      const vMap = getNormalizedVariantMap(v);
      return vMap[cleanOptName] === cleanVal;
    });

    if (!matchingCandidates?.length) return;

    const bestCandidate = [...matchingCandidates].sort((a: any, b: any) => {
      const aInStock = inStockVariantIdSet.has(a.id) ? 1 : 0;
      const bInStock = inStockVariantIdSet.has(b.id) ? 1 : 0;

      if (aInStock !== bInStock) {
        return bInStock - aInStock;
      }

      const aMap = getNormalizedVariantMap(a);
      const bMap = getNormalizedVariantMap(b);
      let aScore = 0;
      let bScore = 0;

      Object.entries(currentNormalized).forEach(([k, v]) => {
        if (aMap[k] === v) aScore += 10;
        if (bMap[k] === v) bScore += 10;
      });

      return bScore - aScore;
    })[0];

    const nextSelection: Record<string, string> = {};
    options.forEach((opt: any) => {
      const optClean = opt.name.trim().toLowerCase();
      const vMap = getNormalizedVariantMap(bestCandidate);
      const matchedVal = opt.productOptionValues?.find(
        (valObj: any) => valObj.value.trim().toLowerCase() === vMap[optClean],
      );
      if (matchedVal) {
        nextSelection[opt.name] = matchedVal.value;
      }
    });

    setSelectedOptions(nextSelection);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant || totalStock <= 0) return;

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        price: currentSellingPrice,
        name: product.name,
        image:
          activeImage || selectedVariant.images?.[0] || product.baseImage || "",
        sku: selectedVariant.sku,
        options: selectedOptions,
      });

      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setReviewError("");
    try {
      await createReviewMutation.mutateAsync({
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewComment("");
    } catch (err: any) {
      setReviewError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit review",
      );
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReviewMutation.mutateAsync(reviewId);
    } catch (err) {
      console.error(err);
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-300" size={32} />
      </div>
    );
  }

  if (!product || !product.id) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-3 text-center px-4">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Product not found
        </h2>
        <p className="text-sm text-neutral-500">
          The requested product could not be located in our catalogue.
        </p>
        <Button
          onClick={() => router.push("/shop")}
          style={{ backgroundColor: "var(--primary)" }}
          className="mt-2 rounded-full text-white hover:opacity-90 px-6 transition-opacity"
        >
          Back to shop
        </Button>
      </div>
    );
  }

  const firstCategory = product.categories?.[0]?.category;

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="bg-[#FBFAF8] min-h-screen pt-20 pb-24"
    >
      <div className="border-b border-neutral-200/70">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex items-center flex-wrap gap-2 text-[13px] text-neutral-500">
          <Link
            href="/"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Home
          </Link>
          <ChevronRight size={13} className="text-neutral-300" />
          <Link
            href="/shop"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Shop
          </Link>
          {firstCategory && (
            <>
              <ChevronRight size={13} className="text-neutral-300" />
              <Link
                href={`/shop?category=${encodeURIComponent(
                  firstCategory.slug || firstCategory.id,
                )}&page=1`}
                className="hover:text-[var(--primary)] transition-colors"
              >
                {firstCategory.name}
              </Link>
            </>
          )}
          <ChevronRight size={13} className="text-neutral-300" />
          <span className="text-neutral-900 font-medium truncate max-w-[220px]">
            {product.name}
          </span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-10 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl overflow-hidden bg-white border border-neutral-200/70 shadow-xs">
              <ProductZoom
                src={activeImage || galleryImages[0]?.url}
                alt={product.name}
              />
            </div>

            {galleryImages?.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                {galleryImages.map((item, idx) => {
                  const isActive = activeImage === item.url;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleThumbnailClick(item)}
                      className={cn(
                        "relative h-[72px] w-[72px] rounded-2xl overflow-hidden border bg-white shrink-0 transition-all cursor-pointer",
                        isActive
                          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/25 shadow-xs"
                          : "border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400",
                      )}
                    >
                      <img
                        src={item.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-7">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.isNew && (
                    <Badge className="bg-white text-neutral-700 text-[11px] font-medium rounded-full border border-neutral-200 px-3 py-1">
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                      New arrival
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-white text-neutral-700 text-[11px] font-medium rounded-full border border-neutral-200 px-3 py-1">
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Best seller
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="bg-white text-neutral-700 text-[11px] font-medium rounded-full border border-neutral-200 px-3 py-1">
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-neutral-900" />
                      Featured
                    </Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleWishlist}
                  className="rounded-full h-9 px-4 gap-2 text-xs font-medium border-neutral-200 hover:border-[var(--primary)] transition-colors cursor-pointer shrink-0"
                >
                  <Heart
                    size={14}
                    className={cn(
                      "transition-colors",
                      isFavorite
                        ? "fill-rose-500 text-rose-500"
                        : "text-neutral-400",
                    )}
                  />
                  <span>{isFavorite ? "Saved" : "Wishlist"}</span>
                </Button>
              </div>

              <h1 className="text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.02em] text-neutral-900 leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-neutral-900 font-medium">
                    {Number(product.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-neutral-400">
                    ({totalReviewsCount} reviews)
                  </span>
                </div>
                <span className="h-1 w-1 rounded-full bg-neutral-300" />
                <span>SKU {selectedVariant?.sku || product.sku || "N/A"}</span>
                <span className="h-1 w-1 rounded-full bg-neutral-300" />
                <span>
                  {stockLoading ? (
                    "Checking stock…"
                  ) : totalStock > 0 ? (
                    <span className="text-emerald-600 font-medium">
                      In stock · {totalStock} available
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      Out of stock
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-[2.75rem] leading-none font-semibold text-neutral-900 tracking-tight">
                ৳
                {currentSellingPrice > 0
                  ? currentSellingPrice.toFixed(2)
                  : "0.00"}
              </span>
              {currentBeforeDiscount &&
                currentBeforeDiscount > currentSellingPrice && (
                  <span className="text-base text-neutral-400 line-through">
                    ৳{currentBeforeDiscount.toFixed(2)}
                  </span>
                )}
              {discountPercentage > 0 && (
                <span className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-1 ml-1">
                  {discountPercentage}% off
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[15px] text-neutral-600 leading-relaxed max-w-[58ch]">
                {product.description}
              </p>
            )}

            <Separator className="bg-neutral-200/70" />

            {options?.length > 0 && (
              <div className="space-y-6">
                {options.map((opt: any) => (
                  <div key={opt.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-900">
                        {opt.name}
                      </span>
                      <span className="text-sm font-semibold capitalize text-[var(--primary)]">
                        {selectedOptions[opt.name]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {opt.productOptionValues?.map((val: any) => {
                        const isSelected =
                          (selectedOptions[opt.name] || "").toLowerCase() ===
                          val.value.toLowerCase();

                        const isDirectlyInStock = isDirectlyCompatible(
                          opt.name,
                          val.value,
                        );

                        return (
                          <button
                            type="button"
                            key={val.id}
                            onClick={() =>
                              handleOptionSelect(opt.name, val.value)
                            }
                            style={
                              isSelected
                                ? {
                                    backgroundColor: "var(--primary)",
                                    borderColor: "var(--primary)",
                                    color: "#ffffff",
                                  }
                                : undefined
                            }
                            className={cn(
                              "relative px-4 py-2 rounded-full border text-sm capitalize transition-all cursor-pointer",
                              isSelected
                                ? "shadow-xs"
                                : isDirectlyInStock
                                  ? "border-neutral-200 text-neutral-700 bg-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                  : "border-dashed border-neutral-300 text-neutral-500 bg-neutral-50/50 hover:border-[var(--primary)] hover:text-[var(--primary)]",
                            )}
                          >
                            {val.value}
                            {!isDirectlyInStock && !isSelected && (
                              <span
                                className="ml-1 text-[10px] font-bold"
                                style={{ color: "var(--primary)" }}
                              >
                                • auto
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 rounded-full p-1 bg-white shadow-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 rounded-full hover:text-[var(--primary)]"
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-10 text-center font-bold text-sm text-neutral-900">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={totalStock > 0 && quantity >= totalStock}
                    onClick={() =>
                      setQuantity((q) => Math.min(totalStock, q + 1))
                    }
                    className="h-9 w-9 rounded-full hover:text-[var(--primary)]"
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                <Button
                  type="button"
                  disabled={
                    !selectedVariant ||
                    totalStock <= 0 ||
                    addToCartMutation.isPending
                  }
                  onClick={handleAddToCart}
                  style={
                    !addedSuccess && totalStock > 0
                      ? { backgroundColor: "var(--primary)" }
                      : undefined
                  }
                  className={cn(
                    "flex-1 h-12 rounded-full font-bold text-sm tracking-wide text-white transition-all shadow-sm cursor-pointer hover:opacity-95 active:scale-[0.99]",
                    addedSuccess &&
                      "bg-emerald-600 text-white hover:bg-emerald-600",
                    totalStock <= 0 && "bg-neutral-300 text-neutral-500",
                  )}
                >
                  {addToCartMutation.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : addedSuccess ? (
                    <>
                      <Check className="mr-2" size={16} /> Added to cart
                    </>
                  ) : totalStock <= 0 ? (
                    "Out of stock"
                  ) : (
                    <>
                      <ShoppingBag className="mr-2" size={16} /> Add to cart
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200/70 pt-6 border-t border-neutral-200/70">
              <div className="flex items-center gap-3 py-3 sm:py-0 sm:pr-4">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  <Truck
                    className="h-4 w-4"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <div className="text-[13px] leading-tight">
                  <p className="font-semibold text-neutral-900">
                    Fast delivery
                  </p>
                  <p className="text-neutral-500">Nationwide express</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 sm:py-0 sm:px-4">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  <RotateCcw
                    className="h-4 w-4"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <div className="text-[13px] leading-tight">
                  <p className="font-semibold text-neutral-900">7 day return</p>
                  <p className="text-neutral-500">Hassle free policy</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 sm:py-0 sm:pl-4">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  <ShieldCheck
                    className="h-4 w-4"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <div className="text-[13px] leading-tight">
                  <p className="font-semibold text-neutral-900">100% genuine</p>
                  <p className="text-neutral-500">Directly sourced</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-14 border-t border-neutral-200/70 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Customer reviews
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Verified buyer ratings and feedback
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-neutral-200/70 shadow-xs">
              <span className="text-3xl font-bold text-neutral-900">
                {Number(product.averageRating || 0).toFixed(1)}
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={cn(
                        star <= Math.round(Number(product.averageRating || 0))
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-200",
                      )}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-neutral-500 font-medium">
                  {totalReviewsCount} total ratings
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-neutral-200/70 space-y-5 shadow-xs">
              <h3 className="text-base font-semibold text-neutral-900">
                Write a review
              </h3>

              {!isAuthenticated ? (
                <div className="space-y-3 text-center py-4">
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    You need to be logged in to share your experience with this
                    product.
                  </p>
                  <Button
                    onClick={() => router.push("/login")}
                    style={{ backgroundColor: "var(--primary)" }}
                    className="w-full h-11 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Log in to review
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-500">
                      Your rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            size={22}
                            className={cn(
                              star <= reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-200 hover:text-amber-300",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-500">
                      Your feedback
                    </label>
                    <Textarea
                      placeholder="What did you like or dislike about this product?"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="min-h-[100px] rounded-xl bg-white border-neutral-200 text-sm resize-none focus:border-[var(--primary)]"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-sm font-medium text-rose-600">
                      {reviewError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                    style={{ backgroundColor: "var(--primary)" }}
                    className="w-full h-11 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {createReviewMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={14} />
                    ) : (
                      "Submit review"
                    )}
                  </Button>
                </form>
              )}
            </div>

            <div className="lg:col-span-8 space-y-4">
              {reviewsLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2
                    className="animate-spin text-neutral-300"
                    size={26}
                  />
                </div>
              ) : reviewsList?.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-neutral-200 space-y-2">
                  <Star size={30} className="mx-auto text-neutral-300" />
                  <p className="text-sm font-medium text-neutral-900">
                    No reviews yet
                  </p>
                  <p className="text-sm text-neutral-500">
                    Be the first to review this product
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-neutral-200/70 divide-y divide-neutral-100 px-6 shadow-xs">
                  {reviewsList.map((rev: any) => {
                    const isOwnReview = user?.id === rev.userId;
                    const dateFormatted = new Date(
                      rev.createdAt,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <div key={rev.id} className="py-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs uppercase"
                              style={{
                                backgroundColor: `${primaryColor}15`,
                                color: "var(--primary)",
                              }}
                            >
                              {rev.userName ? (
                                rev.userName[0]
                              ) : (
                                <UserIcon size={14} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-neutral-900 leading-tight">
                                {rev.userName || "Verified buyer"}
                              </p>
                              <p className="text-[12px] text-neutral-500">
                                {dateFormatted}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  className={cn(
                                    s <= rev.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-neutral-200",
                                  )}
                                />
                              ))}
                            </div>

                            {isOwnReview && (
                              <button
                                type="button"
                                disabled={deleteReviewMutation.isPending}
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-neutral-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {rev.comment && (
                          <p className="text-sm text-neutral-600 leading-relaxed pl-12">
                            {rev.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
