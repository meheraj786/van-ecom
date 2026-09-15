"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlistStore, type WishlistItem } from "@/store/useWishlistStore";
import { useAddToCart } from "@/hooks/useCart";
import { useStocks } from "@/hooks/useInventory";
import WishlistCard from "@/components/clientComponents/product/WishlistCard";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/useThemeStore";

export default function WishlistPage() {
  const { primaryColor } = useThemeStore();
  const { items, clearWishlist } = useWishlistStore();
  const addToCartMutation = useAddToCart();
  const [addingAll, setAddingAll] = React.useState(false);

  const { data: allStocksData } = useStocks({ page: 1, limit: 100 });

  const allStocksList = React.useMemo(() => {
    return (
      allStocksData?.data?.stocks ||
      allStocksData?.stocks ||
      (allStocksData as any)?.data?.items ||
      []
    );
  }, [allStocksData]);

  const variantStockMap = React.useMemo(() => {
    const map = new Map<string, number>();
    allStocksList.forEach((s: any) => {
      if (s.variantId) {
        const current = map.get(s.variantId) || 0;
        map.set(s.variantId, current + (Number(s.quantityRemaining) || 0));
      }
    });
    return map;
  }, [allStocksList]);

  const inStockItems = React.useMemo(() => {
    return items.filter((item) => {
      const targetId = item.variantId || item.productId || item.id;
      const available = variantStockMap.get(targetId) ?? 0;
      return available > 0;
    });
  }, [items, variantStockMap]);

  const handleAddAllToCart = async () => {
    if (!inStockItems?.length) return;
    setAddingAll(true);
    for (const item of inStockItems) {
      try {
        await addToCartMutation.mutateAsync({
          productId: item.productId,
          variantId: item.variantId || item.productId,
          quantity: 1,
          price: item.price,
          name: item.name,
          image: item.image,
          options: item.options,
        });
      } catch (err) {
        console.error(err);
      }
    }
    setAddingAll(false);
  };

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="min-h-screen bg-[#f8f9fb] pt-32 pb-24 px-6 md:px-12"
    >
      <div className="max-w-[1440px] mx-auto space-y-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 uppercase">
              My Wishlist
            </h1>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">
              Your curated list of saved products ({items?.length} items)
            </p>
          </div>
          {items?.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlist}
                className="rounded-xl h-11 px-4 text-xs font-bold text-red-500 hover:text-red-600"
              >
                <Trash2 size={14} className="mr-1.5" /> Clear Wishlist
              </Button>
              <Button
                onClick={handleAddAllToCart}
                disabled={addingAll || inStockItems?.length === 0}
                className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-xs bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={16} className="mr-2" />
                {addingAll
                  ? "Adding In-Stock Items..."
                  : `Add In-Stock To Cart (${inStockItems?.length})`}
              </Button>
            </div>
          )}
        </header>

        <AnimatePresence mode="popLayout">
          {items?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-dashed rounded-[2.5rem] py-36 px-6 text-center space-y-4 max-w-xl mx-auto bg-white"
            >
              <div className="flex justify-center text-gray-300">
                <Heart size={64} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Explore our collections and tap the heart icon to save products
                here.
              </p>
              <Link href="/shop">
                <Button className="h-11 px-8 rounded-xl font-bold uppercase tracking-wider text-xs mt-2">
                  Discover Products
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item: WishlistItem) => {
                const targetId = item.variantId || item.productId || item.id;
                const stock = variantStockMap.get(targetId);

                return (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    availableStock={stock}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
