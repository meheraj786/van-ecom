"use client";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/useWishlistStore";

const WishlistPage = () => {
  const { items, removeItem } = useWishlistStore();

  return (
    <div className="max-w-6xl mx-auto px-10 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-serif text-gray-900">My Wishlist</h1>
        <p className="text-gray-500 mt-2 font-medium">
          You have {items?.length} items saved for later.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:bg-white"
              >
                <Heart size={18} fill="currentColor" />
              </button>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm font-black text-[var(--primary)] mt-1">
                ${item.price.toLocaleString()}
              </p>
              <Button className="w-full h-12 rounded-xl mt-6 font-bold shadow-lg shadow-blue-50">
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
