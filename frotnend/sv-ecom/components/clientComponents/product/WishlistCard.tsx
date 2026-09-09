"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore, type WishlistItem } from "@/store/useWishlistStore";
import { useAddToCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistCardProps {
  item: WishlistItem;
  availableStock?: number;
}

export default function WishlistCard({
  item,
  availableStock,
}: WishlistCardProps) {
  const { removeItem } = useWishlistStore();
  const addToCartMutation = useAddToCart();
  const [addedSuccess, setAddedSuccess] = React.useState(false);

  const stockCount = Number(availableStock ?? 0);
  const isOutOfStock = stockCount <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

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

      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 flex flex-col justify-between space-y-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-50">
        <Image
          src={
            item.image ||
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
          }
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-red-600 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border-none shadow-sm">
              Out of Stock
            </Badge>
          </div>
        )}

        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10 cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-1.5 px-1">
        <Link href={`/shop/product/${item.slug}`}>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1 hover:text-blue-600 transition-colors">
            {item.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-black text-base text-gray-900">
            ৳{Number(item.price || 0).toFixed(2)}
          </span>
          {item.options && Object.keys(item.options)?.length > 0 && (
            <Badge
              variant="secondary"
              className="text-[9px] capitalize bg-gray-50 text-gray-500"
            >
              {Object.values(item.options).join(" / ")}
            </Badge>
          )}
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending || isOutOfStock}
        className={cn(
          "w-full h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
          addedSuccess
            ? "bg-green-600 text-white hover:bg-green-600"
            : isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 border-none shadow-none"
              : "bg-gray-900 text-white hover:bg-gray-800 shadow-md shadow-gray-200",
        )}
      >
        {addToCartMutation.isPending ? (
          <Loader2 className="animate-spin mr-1.5" size={14} />
        ) : addedSuccess ? (
          <>
            <Check size={14} className="mr-1.5" /> Added to Cart
          </>
        ) : isOutOfStock ? (
          "Out of Stock"
        ) : (
          <>
            <ShoppingBag size={14} className="mr-1.5" /> Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
