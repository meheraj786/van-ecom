"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Heart, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Product } from "@/services/productService";
import { useAddToCart } from "@/hooks/useCart";
import { useVariantStockSummary, useStocks } from "@/hooks/useInventory";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product;
  layout?: number;
}

function useProductCardLogic(product: Product) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = React.useState(1);
  const [addedSuccess, setAddedSuccess] = React.useState(false);

  const addToCartMutation = useAddToCart();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const isFavorite = isInWishlist(product.id);

  const options = React.useMemo(
    () =>
      Array.isArray(product?.productOptions) ? product.productOptions : [],
    [product],
  );
  const variants = React.useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product],
  );
  const hasMultipleVariants = variants?.length > 1;

  const { data: allStocksData } = useStocks({ page: 1, limit: 100 });

  const allStocksList = React.useMemo(() => {
    const stockData =
      allStocksData?.data?.stocks ||
      allStocksData?.stocks ||
      (allStocksData as any)?.data?.items ||
      [];
    return Array.isArray(stockData) ? stockData : [];
  }, [allStocksData]);

  const productStocks = React.useMemo(() => {
    if (!allStocksList?.length || !variants?.length) return [];
    const variantIds = new Set(variants.map((v: any) => v.id));
    return allStocksList.filter(
      (s: any) => variantIds.has(s.variantId) && s.quantityRemaining > 0,
    );
  }, [allStocksList, variants]);

  const inStockVariantIdSet = React.useMemo(() => {
    return new Set(productStocks.map((s: any) => s.variantId));
  }, [productStocks]);

  const priceRange = React.useMemo(() => {
    if (!productStocks?.length) return null;
    const prices = productStocks.map((s: any) => Number(s.sellingPrice));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const discountedBatch = productStocks.find(
      (s: any) => s.isDiscounted && s.beforeDiscount,
    );
    const beforeDiscount = discountedBatch
      ? Number(discountedBatch.beforeDiscount)
      : null;

    return { min, max, beforeDiscount };
  }, [productStocks]);

  const totalProductStock = React.useMemo(() => {
    return productStocks.reduce(
      (sum: number, s: any) => sum + (Number(s.quantityRemaining) || 0),
      0,
    );
  }, [productStocks]);

  const getNormalizedVariantMap = (variant: any): Record<string, string> => {
    const map: Record<string, string> = {};
    const variantValues = Array.isArray(variant?.productVariantValues)
      ? variant.productVariantValues
      : [];
    variantValues.forEach((pvv: any) => {
      const optName = (pvv.optionValue?.option?.name || pvv.option?.name || "")
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
  };

  React.useEffect(() => {
    if (variants?.length > 0 && options?.length > 0) {
      const inStockVariant =
        variants.find((v: any) => inStockVariantIdSet.has(v.id)) || variants[0];

      const initialSelection: Record<string, string> = {};
      options.forEach((opt: any) => {
        const optClean = opt.name.trim().toLowerCase();
        const vMap = getNormalizedVariantMap(inStockVariant);
        const optionValues = Array.isArray(opt.productOptionValues)
          ? opt.productOptionValues
          : [];
        const match = optionValues.find(
          (val: any) => val.value?.trim().toLowerCase() === vMap[optClean],
        );
        if (match) {
          initialSelection[opt.name] = match.value;
        } else if (optionValues[0]) {
          initialSelection[opt.name] = optionValues[0].value;
        }
      });

      setSelectedOptions(initialSelection);
    }
  }, [variants, options, inStockVariantIdSet]);

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
  }, [variants, options, selectedOptions]);

  const { data: stockSummaryResponse, isLoading: stockLoading } =
    useVariantStockSummary(selectedVariant?.id);

  const stockSummary: any =
    (stockSummaryResponse as any)?.data || stockSummaryResponse;

  const currentVariantStock = React.useMemo(() => {
    if (stockSummary?.totalStock > 0) return stockSummary.totalStock;
    const match = productStocks.find(
      (s: any) => s.variantId === selectedVariant?.id,
    );
    return match?.quantityRemaining || 0;
  }, [stockSummary, productStocks, selectedVariant]);

  const currentSellingPrice = React.useMemo(() => {
    if (stockSummary?.currentSellingPrice > 0)
      return stockSummary.currentSellingPrice;
    const match = productStocks.find(
      (s: any) => s.variantId === selectedVariant?.id,
    );
    return match?.sellingPrice || priceRange?.min || 0;
  }, [stockSummary, productStocks, selectedVariant, priceRange]);

  const currentBeforeDiscount = React.useMemo(() => {
    const match = productStocks.find(
      (s: any) => s.variantId === selectedVariant?.id,
    );
    return match?.isDiscounted && match?.beforeDiscount
      ? Number(match.beforeDiscount)
      : null;
  }, [productStocks, selectedVariant]);

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

  const displayImage =
    selectedVariant?.images?.[0] ||
    product.baseImage ||
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=600";

  const secondaryImage = product.variants?.[1]?.images?.[0] || displayImage;
  const firstCategory = product.categories?.[0]?.category?.name;

  const isOutOfStock = allStocksList?.length > 0 && totalProductStock <= 0;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem({
      id: product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      price: currentSellingPrice,
      image: displayImage,
      options: selectedOptions,
    });
  };

  const handleQuickAddClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasMultipleVariants) {
      setIsModalOpen(true);
      return;
    }

    if (!selectedVariant || currentVariantStock <= 0) return;

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: 1,
        price: currentSellingPrice,
        name: product.name,
        image: displayImage,
        sku: selectedVariant.sku,
        options: selectedOptions,
      });

      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalAddToCart = async () => {
    if (!selectedVariant || currentVariantStock <= 0) return;

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        price: currentSellingPrice,
        name: product.name,
        image: displayImage,
        sku: selectedVariant.sku,
        options: selectedOptions,
      });

      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        setIsModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptionSelect = (targetOptName: string, targetVal: string) => {
    const cleanOptName = targetOptName.trim().toLowerCase();
    const cleanVal = targetVal.trim().toLowerCase();

    const currentNormalized: Record<string, string> = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      currentNormalized[k.trim().toLowerCase()] = v.trim().toLowerCase();
    });

    const hypothetical = { ...currentNormalized, [cleanOptName]: cleanVal };

    const directMatch = variants.find((v: any) => {
      const vMap = getNormalizedVariantMap(v);
      return Object.entries(hypothetical).every(([k, val]) => vMap[k] === val);
    });

    if (directMatch) {
      setSelectedOptions((prev) => ({
        ...prev,
        [targetOptName]: targetVal,
      }));
      setQuantity(1);
      return;
    }

    const candidates = variants.filter((v: any) => {
      const vMap = getNormalizedVariantMap(v);
      return vMap[cleanOptName] === cleanVal;
    });

    if (!candidates?.length) return;

    const bestCandidate = [...candidates].sort((a: any, b: any) => {
      const aInStock = inStockVariantIdSet.has(a.id) ? 1 : 0;
      const bInStock = inStockVariantIdSet.has(b.id) ? 1 : 0;
      if (aInStock !== bInStock) return bInStock - aInStock;

      const aMap = getNormalizedVariantMap(a);
      const bMap = getNormalizedVariantMap(b);
      let aScore = 0;
      let bScore = 0;
      Object.entries(currentNormalized).forEach(([k, v]) => {
        if (aMap[k] === v) aScore++;
        if (bMap[k] === v) bScore++;
      });
      return bScore - aScore;
    })[0];

    const nextSelection: Record<string, string> = {};
    options.forEach((opt: any) => {
      const optClean = opt.name.trim().toLowerCase();
      const vMap = getNormalizedVariantMap(bestCandidate);
      const matchedVal = opt.productOptionValues?.find(
        (valObj: any) => valObj.value?.trim().toLowerCase() === vMap[optClean],
      );
      if (matchedVal) {
        nextSelection[opt.name] = matchedVal.value;
      }
    });

    setSelectedOptions(nextSelection);
    setQuantity(1);
  };

  return {
    isHovered,
    setIsHovered,
    isModalOpen,
    setIsModalOpen,
    quantity,
    setQuantity,
    addedSuccess,
    addToCartMutation,
    isFavorite,
    options,
    variants,
    hasMultipleVariants,
    allStocksList,
    priceRange,
    totalProductStock,
    selectedVariant,
    selectedOptions,
    stockLoading,
    currentVariantStock,
    currentSellingPrice,
    currentBeforeDiscount,
    discountPercentage,
    displayImage,
    secondaryImage,
    firstCategory,
    isOutOfStock,
    handleToggleWishlist,
    handleQuickAddClick,
    handleModalAddToCart,
    handleOptionSelect,
  };
}

function VariantDialog({
  product,
  logic,
}: {
  product: Product;
  logic: ReturnType<typeof useProductCardLogic>;
}) {
  const {
    isModalOpen,
    setIsModalOpen,
    displayImage,
    currentSellingPrice,
    currentBeforeDiscount,
    selectedVariant,
    stockLoading,
    currentVariantStock,
    options,
    selectedOptions,
    handleOptionSelect,
    quantity,
    setQuantity,
    addToCartMutation,
    addedSuccess,
    handleModalAddToCart,
  } = logic;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-neutral-900">
            Select options
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex gap-4 items-center">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200 shrink-0 shadow-xs">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">
                  ৳{currentSellingPrice.toFixed(0)}
                </span>
                {currentBeforeDiscount && (
                  <span className="text-sm text-neutral-400 line-through">
                    ৳{currentBeforeDiscount.toFixed(0)}
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-400 block font-mono">
                SKU {selectedVariant?.sku || "N/A"}
              </span>
              <span className="text-xs font-semibold block pt-0.5">
                {stockLoading ? (
                  "Checking stock…"
                ) : currentVariantStock > 0 ? (
                  <span className="text-emerald-600">
                    In stock · {currentVariantStock} left
                  </span>
                ) : (
                  <span className="text-rose-600">Out of stock</span>
                )}
              </span>
            </div>
          </div>

          {options.map((opt: any) => (
            <div key={opt.id} className="space-y-2">
              <span className="text-sm font-semibold text-neutral-900 block">
                {opt.name}{" "}
                <span className="font-bold text-[var(--primary)] capitalize">
                  · {selectedOptions[opt.name]}
                </span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(opt.productOptionValues)
                  ? opt.productOptionValues
                  : []
                ).map((val: any) => {
                  const isSelected =
                    (selectedOptions[opt.name] || "").toLowerCase() ===
                    val.value?.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={val.id || val.value}
                      onClick={() => handleOptionSelect(opt.name, val.value)}
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
                        "px-3.5 py-2 rounded-full border text-xs font-medium capitalize transition-all cursor-pointer",
                        isSelected
                          ? "shadow-xs"
                          : "border-neutral-200 text-neutral-700 bg-white hover:border-[var(--primary)] hover:text-[var(--primary)]",
                      )}
                    >
                      {val.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-neutral-200 rounded-full p-1 bg-white shadow-xs">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors hover:text-[var(--primary)]"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center font-bold text-xs text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                disabled={
                  currentVariantStock > 0 && quantity >= currentVariantStock
                }
                onClick={() =>
                  setQuantity((q) => Math.min(currentVariantStock, q + 1))
                }
                className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors hover:text-[var(--primary)]"
              >
                <Plus size={12} />
              </button>
            </div>

            <Button
              type="button"
              disabled={
                !selectedVariant ||
                currentVariantStock <= 0 ||
                addToCartMutation.isPending
              }
              onClick={handleModalAddToCart}
              style={
                !addedSuccess && currentVariantStock > 0
                  ? { backgroundColor: "var(--primary)" }
                  : undefined
              }
              className={cn(
                "flex-1 h-11 rounded-full text-xs font-bold text-white transition-all shadow-sm cursor-pointer hover:opacity-95",
                addedSuccess &&
                  "bg-emerald-600 text-white hover:bg-emerald-600",
                currentVariantStock <= 0 && "bg-neutral-300 text-neutral-500",
              )}
            >
              {addToCartMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : addedSuccess ? (
                <>
                  <Check className="mr-2" size={16} /> Added to cart
                </>
              ) : currentVariantStock <= 0 ? (
                "Out of stock"
              ) : (
                <>
                  <ShoppingBag className="mr-2" size={16} /> Add to cart
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProductCard1({ product }: ProductCardProps) {
  const logic = useProductCardLogic(product);
  const {
    isHovered,
    setIsHovered,
    isFavorite,
    hasMultipleVariants,
    priceRange,
    currentSellingPrice,
    discountPercentage,
    displayImage,
    secondaryImage,
    firstCategory,
    isOutOfStock,
    handleToggleWishlist,
    handleQuickAddClick,
    addedSuccess,
    addToCartMutation,
  } = logic;

  return (
    <>
      <div
        className="group relative flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-2xs">
          <Image
            src={isHovered && secondaryImage ? secondaryImage : displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center z-20 cursor-pointer shadow-xs hover:scale-110 transition-transform"
          >
            <Heart
              size={14}
              className={cn(
                "transition-colors",
                isFavorite ? "fill-rose-500 text-rose-500" : "text-neutral-500",
              )}
            />
          </button>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discountPercentage > 0 && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur text-[11px] font-bold text-neutral-900 rounded-full px-2.5 py-1 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {discountPercentage}% off
              </span>
            )}
            {isOutOfStock && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur text-[11px] font-bold text-neutral-900 rounded-full px-2.5 py-1 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                Out of stock
              </span>
            )}
            {product.isNew && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur text-[11px] font-bold text-neutral-900 rounded-full px-2.5 py-1 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary,#111827)]" />
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur text-[11px] font-bold text-neutral-900 rounded-full px-2.5 py-1 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Best seller
              </span>
            )}
            {product.isFeatured && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur text-[11px] font-bold text-neutral-900 rounded-full px-2.5 py-1 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                Featured
              </span>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              type="button"
              disabled={addToCartMutation.isPending || isOutOfStock}
              onClick={handleQuickAddClick}
              style={
                !addedSuccess && !isOutOfStock
                  ? { backgroundColor: "var(--primary)" }
                  : undefined
              }
              className={cn(
                "w-full h-11 flex items-center justify-center gap-2 text-xs font-bold text-white transition-all cursor-pointer shadow-md",
                addedSuccess &&
                  "bg-emerald-600 text-white hover:bg-emerald-600",
                isOutOfStock &&
                  "bg-neutral-800 text-neutral-400 cursor-not-allowed",
              )}
            >
              {addToCartMutation.isPending ? (
                <Loader2 className="animate-spin" size={14} />
              ) : addedSuccess ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : isOutOfStock ? (
                "Out of stock"
              ) : hasMultipleVariants ? (
                <>
                  <ShoppingBag size={14} /> Choose options
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Quick add
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-3.5 flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            {firstCategory && (
              <span className="text-[11px] font-medium text-neutral-400 block truncate">
                {firstCategory}
              </span>
            )}
            <Link href={`/shop/product/${product.slug}`}>
              <h3 className="font-semibold text-neutral-900 text-sm leading-snug truncate hover:text-[var(--primary)] transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="text-right shrink-0">
            {isOutOfStock ? (
              <span className="text-xs font-bold text-rose-600">
                Out of stock
              </span>
            ) : priceRange ? (
              <span className="font-bold text-sm text-neutral-900">
                {priceRange.min === priceRange.max
                  ? `৳${priceRange.min.toFixed(0)}`
                  : `৳${priceRange.min.toFixed(0)}–${priceRange.max.toFixed(0)}`}
              </span>
            ) : currentSellingPrice > 0 ? (
              <span className="font-bold text-sm text-neutral-900">
                ৳{currentSellingPrice.toFixed(0)}
              </span>
            ) : (
              <span className="text-xs text-neutral-500 font-medium">
                Available
              </span>
            )}
          </div>
        </div>
      </div>

      <VariantDialog product={product} logic={logic} />
    </>
  );
}

export function ProductCard2({ product }: ProductCardProps) {
  const logic = useProductCardLogic(product);
  const {
    isHovered,
    setIsHovered,
    isFavorite,
    hasMultipleVariants,
    priceRange,
    currentSellingPrice,
    discountPercentage,
    displayImage,
    secondaryImage,
    firstCategory,
    isOutOfStock,
    handleToggleWishlist,
    handleQuickAddClick,
    addedSuccess,
    addToCartMutation,
    variants,
  } = logic;

  return (
    <>
      <div
        className="group relative flex flex-col bg-white rounded-[28px] border border-neutral-200/90 p-3 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-neutral-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-neutral-50">
          <Image
            src={isHovered && secondaryImage ? secondaryImage : displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute top-3 left-3 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-xs z-20 cursor-pointer hover:scale-110 transition-transform"
          >
            <Heart
              size={14}
              className={cn(
                "transition-colors",
                isFavorite ? "fill-rose-500 text-rose-500" : "text-neutral-500",
              )}
            />
          </button>

          {(discountPercentage > 0 ||
            product.isNew ||
            product.isBestSeller ||
            product.isFeatured ||
            isOutOfStock) && (
            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
              {discountPercentage > 0 && (
                <Badge className="bg-rose-600 hover:bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-none shadow-xs">
                  −{discountPercentage}%
                </Badge>
              )}
              {isOutOfStock && (
                <Badge className="bg-neutral-900 hover:bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-none shadow-xs">
                  Out of stock
                </Badge>
              )}
              {product.isNew && (
                <Badge
                  style={{ borderColor: "var(--primary)" }}
                  className="bg-white hover:bg-white text-neutral-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] mr-1" />{" "}
                  New
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-white hover:bg-white text-neutral-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-neutral-200 shadow-2xs">
                  Best seller
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="bg-white hover:bg-white text-neutral-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-neutral-200 shadow-2xs">
                  Featured
                </Badge>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={addToCartMutation.isPending || isOutOfStock}
            onClick={handleQuickAddClick}
            style={
              !addedSuccess && !isOutOfStock
                ? { backgroundColor: "var(--primary)" }
                : undefined
            }
            className={cn(
              "absolute bottom-3 right-3 h-11 w-11 rounded-full flex items-center justify-center shadow-lg z-10 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 cursor-pointer text-white hover:opacity-95 active:scale-95",
              addedSuccess && "bg-emerald-600 text-white",
              isOutOfStock &&
                "bg-neutral-300 text-neutral-500 cursor-not-allowed",
            )}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : addedSuccess ? (
              <Check size={16} />
            ) : (
              <ShoppingBag size={16} />
            )}
          </button>
        </div>

        <div className="pt-4 pb-1 px-1.5 space-y-2.5">
          <div className="space-y-0.5">
            {firstCategory && (
              <span className="text-[11px] font-medium text-neutral-400 block truncate">
                {firstCategory}
              </span>
            )}
            <Link href={`/shop/product/${product.slug}`}>
              <h3 className="font-bold text-neutral-900 text-[15px] leading-snug line-clamp-1 hover:text-[var(--primary)] transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-2.5">
            <div className="flex items-baseline gap-1.5">
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600">
                  Out of stock
                </span>
              ) : priceRange ? (
                <span className="font-bold text-[15px] text-neutral-900">
                  {priceRange.min === priceRange.max
                    ? `৳${priceRange.min.toFixed(0)}`
                    : `৳${priceRange.min.toFixed(0)}–${priceRange.max.toFixed(0)}`}
                </span>
              ) : currentSellingPrice > 0 ? (
                <span className="font-bold text-[15px] text-neutral-900">
                  ৳{currentSellingPrice.toFixed(0)}
                </span>
              ) : (
                <span className="text-xs text-neutral-500 font-medium">
                  Available
                </span>
              )}
              {priceRange?.beforeDiscount &&
                priceRange.beforeDiscount > (priceRange.min || 0) && (
                  <span className="text-xs text-neutral-400 line-through font-medium">
                    ৳{priceRange.beforeDiscount.toFixed(0)}
                  </span>
                )}
            </div>

            {hasMultipleVariants && (
              <span className="text-[11px] font-semibold text-neutral-400">
                {variants?.length} options
              </span>
            )}
          </div>
        </div>
      </div>

      <VariantDialog product={product} logic={logic} />
    </>
  );
}

export function ProductCard3({ product }: ProductCardProps) {
  const logic = useProductCardLogic(product);
  const {
    isHovered,
    setIsHovered,
    isFavorite,
    hasMultipleVariants,
    priceRange,
    currentSellingPrice,
    discountPercentage,
    displayImage,
    secondaryImage,
    firstCategory,
    isOutOfStock,
    handleToggleWishlist,
    handleQuickAddClick,
    addedSuccess,
    addToCartMutation,
  } = logic;

  return (
    <>
      <div
        className="group relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-neutral-900 shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={isHovered && secondaryImage ? secondaryImage : displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/0" />

        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center z-20 cursor-pointer hover:scale-110 transition-transform shadow-xs"
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              isFavorite ? "fill-rose-500 text-rose-500" : "text-white",
            )}
          />
        </button>

        {(discountPercentage > 0 ||
          product.isNew ||
          product.isBestSeller ||
          product.isFeatured ||
          isOutOfStock) && (
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            {discountPercentage > 0 && (
              <span className="text-[11px] font-bold text-white bg-rose-600 rounded-full px-2.5 py-1 shadow-xs">
                −{discountPercentage}%
              </span>
            )}
            {isOutOfStock && (
              <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur rounded-full px-2.5 py-1">
                Out of stock
              </span>
            )}
            {product.isNew && (
              <span
                style={{ backgroundColor: "var(--primary)" }}
                className="text-[11px] font-bold text-white rounded-full px-2.5 py-1 shadow-xs"
              >
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur rounded-full px-2.5 py-1">
                Best seller
              </span>
            )}
            {product.isFeatured && (
              <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur rounded-full px-2.5 py-1">
                Featured
              </span>
            )}
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {firstCategory && (
              <span className="text-[11px] text-white/70 font-medium block mb-0.5 truncate">
                {firstCategory}
              </span>
            )}
            <Link href={`/shop/product/${product.slug}`}>
              <h3 className="font-bold text-white text-[15px] leading-snug line-clamp-1 hover:text-[var(--primary)] transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="mt-1">
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-300">
                  Out of stock
                </span>
              ) : priceRange ? (
                <span className="font-bold text-sm text-white">
                  {priceRange.min === priceRange.max
                    ? `৳${priceRange.min.toFixed(0)}`
                    : `৳${priceRange.min.toFixed(0)}–${priceRange.max.toFixed(0)}`}
                </span>
              ) : currentSellingPrice > 0 ? (
                <span className="font-bold text-sm text-white">
                  ৳{currentSellingPrice.toFixed(0)}
                </span>
              ) : (
                <span className="text-xs text-white/70 font-medium">
                  Available
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={addToCartMutation.isPending || isOutOfStock}
            onClick={handleQuickAddClick}
            className={cn(
              "shrink-0 h-10 w-10 group-hover:w-auto group-hover:px-4 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 cursor-pointer shadow-lg",
              addedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-white text-neutral-900 hover:bg-[var(--primary)] hover:text-white",
            )}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="animate-spin shrink-0" size={15} />
            ) : addedSuccess ? (
              <>
                <Check size={15} className="shrink-0" />
                <span className="hidden group-hover:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} className="shrink-0" />
                <span className="hidden group-hover:inline">
                  {hasMultipleVariants ? "Choose options" : "Quick add"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <VariantDialog product={product} logic={logic} />
    </>
  );
}

export default function ProductCard({ product, layout }: ProductCardProps) {
  const { data: theme } = useTheme();
  const cardLayout = layout || (theme as any)?.product?.cardLayout || 1;
  const primaryColor = theme?.primaryColor || "#111827";

  return (
    <div style={{ "--primary": primaryColor } as React.CSSProperties}>
      {cardLayout === 2 ? (
        <ProductCard2 product={product} />
      ) : cardLayout === 3 ? (
        <ProductCard3 product={product} />
      ) : (
        <ProductCard1 product={product} />
      )}
    </div>
  );
}
