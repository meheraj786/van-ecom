"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuthStore } from "@/store/useAuthStore";
import { useStocks } from "@/hooks/useInventory";
import { useValidateCoupon } from "@/hooks/useCoupon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { CartItem, StockBatch } from "@/types";
import { User } from "@/services/authService";

export default function UnifiedCartPage() {
  const router = useRouter();
  const { primaryColor } = useThemeStore();
  const { user } = useAuthStore();
  const { items, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const validateCouponMutation = useValidateCoupon();

  const { data: allStocksData } = useStocks({ page: 1, limit: 100 });

  const [promoCode, setPromoCode] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [discountCode, setDiscountCode] = React.useState("");
  const [couponError, setCouponError] = React.useState("");

  const allStocksList = React.useMemo<StockBatch[]>(() => {
    const response = allStocksData as
      | {
          data?: { stocks?: StockBatch[]; items?: StockBatch[] };
          stocks?: StockBatch[];
        }
      | undefined;

    if (Array.isArray(response?.data?.stocks)) return response.data.stocks;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.stocks)) return response.stocks;
    return [];
  }, [allStocksData]);

  const variantStockMap = React.useMemo(() => {
    const map = new Map<string, number>();
    allStocksList.forEach((s: StockBatch) => {
      if (s.variantId) {
        const current = map.get(s.variantId) || 0;
        map.set(s.variantId, current + (Number(s.quantityRemaining) || 0));
      }
    });
    return map;
  }, [allStocksList]);

  const subtotal = React.useMemo(() => {
    return (items || []).reduce((sum: number, item: any) => {
      const itemPrice = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + itemPrice * qty;
    }, 0);
  }, [items]);

  const totalAmount = Math.max(0, subtotal - appliedDiscount);

  const hasExceededStock = React.useMemo(() => {
    return (items || []).some((item: any) => {
      const targetId = item.variantId || item.productId;
      const available = variantStockMap.get(targetId);
      return available !== undefined && Number(item.quantity) > available;
    });
  }, [items, variantStockMap]);

  const handleIncrement = (item: any) => {
    const itemKey = item.variantId || item.productId;
    const currentQty = Number(item.quantity) || 1;
    const availableStock = variantStockMap.get(
      item.variantId || item.productId,
    );

    if (availableStock !== undefined && currentQty >= availableStock) {
      return;
    }

    updateQuantity(itemKey, currentQty + 1);
  };

  const handleDecrement = (item: any) => {
    const itemKey = item.variantId || item.productId;
    const currentQty = Number(item.quantity) || 1;
    updateQuantity(itemKey, currentQty - 1);
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a promo code");
      return;
    }

    setCouponError("");

    try {
      const userId = user?.id || (user as User)?.userId || "GUEST";
      const res = await validateCouponMutation.mutateAsync({
        userId,
        code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: Number(i.quantity) || 1,
          price: Number(i.price) || 0,
        })),
      });

      const couponData = res?.data || res;
      const discount = couponData?.discountAmount || 0;

      setAppliedDiscount(discount);
      setDiscountCode(couponData?.code || code);
      setPromoCode("");
    } catch (error: unknown) {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setCouponError(
        errorResponse.response?.data?.message ||
          errorResponse.message ||
          "Invalid or expired promo code",
      );
      setAppliedDiscount(0);
      setDiscountCode("");
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(0);
    setDiscountCode("");
    setCouponError("");
  };

  const handleProceedToCheckout = () => {
    if (hasExceededStock) return;
    const query = discountCode
      ? `?couponCode=${encodeURIComponent(discountCode)}`
      : "";
    router.push(`/checkout${query}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="bg-white min-h-screen pt-10 pb-24"
    >
      <div className="border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-blue-600 transition-colors">
            Shop
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900">Cart</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 uppercase">
              Shopping Cart
            </h1>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">
              Review and manage your selected variations
            </p>
          </div>
          {items && items?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} className="mr-1.5" /> Clear Cart
            </Button>
          )}
        </header>

        {!items || items?.length === 0 ? (
          <div className="border border-dashed rounded-[2.5rem] py-32 px-6 text-center space-y-4 max-w-xl mx-auto">
            <div className="flex justify-center text-gray-300">
              <ShoppingBag size={72} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Explore our collections and choose from our diverse selection of
              variants.
            </p>
            <Button
              onClick={() => router.push("/shop")}
              className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs mt-2"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
            <div className="lg:col-span-8 divide-y divide-gray-100 border-t border-b border-gray-100">
              {hasExceededStock && (
                <div className="p-4 my-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs font-bold">
                  <AlertTriangle
                    size={18}
                    className="shrink-0 text-amber-600"
                  />
                  <span>
                    Some items in your cart exceed available stock. Please
                    reduce the quantity to proceed to checkout.
                  </span>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {items.map((item: CartItem) => {
                  const itemKey = item.variantId || item.productId;
                  const itemImg =
                    item.image ||
                    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=300";

                  const targetVariantId = item.variantId || item.productId;
                  const availableStock = variantStockMap.get(targetVariantId);
                  const currentQty = Number(item.quantity) || 1;
                  const isMaxReached =
                    availableStock !== undefined &&
                    currentQty >= availableStock;
                  const isExceeded =
                    availableStock !== undefined && currentQty > availableStock;

                  return (
                    <motion.div
                      key={itemKey}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          <Image
                            src={itemImg}
                            alt={item.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">
                            {item.name || "Product Item"}
                          </h3>

                          {item.options &&
                          Object.keys(item.options)?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(item.options).map(
                                ([optName, optVal]) => (
                                  <Badge
                                    key={optName}
                                    variant="secondary"
                                    className="text-[10px] font-medium py-0.5 px-2 bg-gray-100 text-gray-700"
                                  >
                                    <span className="text-gray-400 mr-1 capitalize">
                                      {optName}:
                                    </span>
                                    <span className="capitalize">
                                      {String(optVal)}
                                    </span>
                                  </Badge>
                                ),
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-mono">
                              SKU: {item.sku || "STANDARD"}
                            </span>
                          )}

                          <p className="text-sm font-black text-gray-900 pt-1">
                            ৳{Number(item.price || 0).toFixed(2)}
                          </p>

                          {availableStock !== undefined && (
                            <div className="pt-0.5">
                              {isExceeded ? (
                                <span className="text-[11px] font-bold text-red-600 block">
                                  Only {availableStock} available in stock!
                                </span>
                              ) : isMaxReached ? (
                                <span className="text-[10px] font-bold text-amber-600 block">
                                  Max stock limit reached ({availableStock} max)
                                </span>
                              ) : availableStock <= 5 ? (
                                <span className="text-[10px] font-semibold text-gray-400 block">
                                  Only {availableStock} left in stock
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                        <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white">
                          <button
                            type="button"
                            onClick={() => handleDecrement(item)}
                            className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            className={cn(
                              "w-10 text-center font-bold text-xs",
                              isExceeded
                                ? "text-red-600 font-black"
                                : "text-gray-900",
                            )}
                          >
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            disabled={isMaxReached}
                            onClick={() => handleIncrement(item)}
                            className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <span className="font-black text-base text-gray-900 block">
                            ৳{(Number(item.price || 0) * currentQty).toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(itemKey)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-100/60 space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> Coupon ({discountCode})
                      </span>
                      <span className="font-bold">
                        -৳{appliedDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Delivery</span>
                    <span className="font-bold text-gray-700">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Promo Code
                  </Label>
                  {appliedDiscount > 0 ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700">
                          {discountCode} applied (-৳{appliedDiscount.toFixed(2)}
                          )
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. SUMMER50"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            if (couponError) setCouponError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyPromo();
                            }
                          }}
                          className="h-11 rounded-xl uppercase text-xs font-mono font-bold"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            validateCouponMutation.isPending ||
                            !promoCode.trim()
                          }
                          onClick={handleApplyPromo}
                          className="h-11 rounded-xl px-5 font-bold text-xs"
                        >
                          {validateCouponMutation.isPending ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs font-bold text-red-500">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    ৳{totalAmount.toFixed(2)}
                  </span>
                </div>

                <Button
                  size="lg"
                  disabled={hasExceededStock}
                  onClick={handleProceedToCheckout}
                  className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasExceededStock
                    ? "Adjust Quantity to Checkout"
                    : "Proceed To Checkout"}
                </Button>

                <div className="pt-2 flex justify-center items-center gap-6 text-gray-300">
                  <CreditCard size={22} />
                  <Truck size={22} />
                  <ShieldCheck size={22} />
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
