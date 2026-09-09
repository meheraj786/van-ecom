"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  CreditCard,
  Heart,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAddToCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/services/productService";

export default function CustomerDashboardPage() {
  const { primaryColor } = useThemeStore();
  const { user } = useAuthStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const addToCartMutation = useAddToCart();

  const { data: ordersResponse, isLoading: ordersLoading } = useOrders({
    page: 1,
    limit: 5,
  });

  const { data: productsResponse } = useProducts({
    page: 1,
    limit: 3,
    isFeatured: true,
  });

  const orders = ordersResponse?.orders || [];

  const totalOrdersCount = ordersResponse?.meta?.totalOrders || orders?.length;

  const totalSpent = React.useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  const featuredProducts = productsResponse?.data?.items || [];

  const handleQuickAdd = async (prod: Product) => {
    const defaultVariant = prod.variants?.[0];
    if (!defaultVariant) return;

    try {
      await addToCartMutation.mutateAsync({
        productId: prod.id,
        variantId: defaultVariant.id,
        quantity: 1,
        price: 0,
        name: prod.name,
        image: prod.baseImage || defaultVariant.images?.[0] || "",
        sku: defaultVariant.sku,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
            Customer Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 leading-tight">
            Welcome back, {user?.name || "e-com Member"}
          </h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Track and manage your recent orders, deliveries, and saved items.
          </p>
        </div>
        <Link href="/shop">
          <Button className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2">
            <Plus size={16} /> Explore Shop
          </Button>
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Orders",
            value: totalOrdersCount.toString(),
            badge: "All Time",
            bColor: "bg-blue-50 text-blue-600",
            icon: Package,
          },
          {
            label: "Lifetime Spending",
            value: `৳${totalSpent.toFixed(2)}`,
            badge: "BDT (৳)",
            bColor: "bg-emerald-50 text-emerald-600",
            icon: CreditCard,
          },
          {
            label: "Saved in Wishlist",
            value: wishlistItems?.length.toString(),
            badge: "Wishlist",
            bColor: "bg-rose-50 text-rose-600",
            icon: Heart,
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl", stat.bColor.split(" ")[0])}>
                <stat.icon size={22} className={stat.bColor.split(" ")[1]} />
              </div>
              <Badge
                className={cn(
                  "rounded-full border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-widest",
                  stat.bColor,
                )}
              >
                {stat.badge}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <section className="xl:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-7 flex justify-between items-center border-b border-gray-50">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">
                Recent Orders
              </h3>
              <p className="text-xs text-gray-400">
                Your latest purchase activity
              </p>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin text-gray-300" size={28} />
            </div>
          ) : orders?.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag
                size={48}
                className="mx-auto text-gray-300"
                strokeWidth={1.5}
              />
              <p className="text-gray-900 font-bold text-sm">No orders yet</p>
              <Link
                href="/shop"
                className="text-xs font-bold text-blue-600 underline"
              >
                Start shopping now
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest">
                    Order ID
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Date
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Items
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Amount
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const formattedDate = new Date(
                    order.createdAt,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="px-6 font-mono font-bold text-xs text-gray-900">
                        #ORD-{order.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 font-medium">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-gray-700">
                        {order.items?.length || 0} items
                      </TableCell>
                      <TableCell className="text-xs font-black text-gray-900">
                        ৳{Number(order.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border",
                            order.status === "PAID"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>

        <section className="xl:col-span-4 space-y-6">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-gray-200">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                e-com Member
              </span>
            </div>
            <h3 className="text-2xl font-serif leading-tight">
              Curated Experience
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              Enjoy verified deliveries, real-time tracking, and exclusive
              discounts.
            </p>
          </div>

          {featuredProducts?.length > 0 && (
            <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">
                Featured For You
              </span>
              <div className="space-y-4">
                {featuredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center gap-4 p-2 rounded-2xl hover:bg-gray-50 transition-all"
                  >
                    <div className="h-14 w-14 relative rounded-xl overflow-hidden bg-gray-100 border shrink-0">
                      <Image
                        src={
                          prod.baseImage ||
                          "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=200"
                        }
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${prod.slug}`}>
                        <p className="text-xs font-bold text-gray-900 truncate hover:text-blue-600">
                          {prod.name}
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod)}
                        className="text-[10px] font-bold text-blue-600 hover:underline mt-1 block uppercase"
                      >
                        Quick Add +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
