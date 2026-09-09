"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Package, ShoppingBag } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import OrderCard from "@/components/clientComponents/dashboard/OrderCard";
import { useThemeStore } from "@/store/useThemeStore";
import { Button } from "@/components/ui/button";

export default function CustomerOrderHistoryPage() {
  const { primaryColor } = useThemeStore();
  const [page] = React.useState(1);
  const [limit] = React.useState(10);

  const dynamicStyles = { "--primary": primaryColor } as React.CSSProperties;

  const { data: ordersResponse, isLoading: isFetchingOrders } = useOrders({
    page,
    limit,
  });

  const orders =
    ordersResponse?.orders ||
    (ordersResponse as any)?.data?.orders ||
    (ordersResponse as any)?.data?.items ||
    [];

  if (isFetchingOrders) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fcfcfc]">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  return (
    <div
      style={dynamicStyles}
      className="flex min-h-screen justify-center bg-[#fcfcfc] pt-28 pb-20"
    >
      <main className="flex-1 px-6 md:px-12 max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif text-gray-900 tracking-tight">
            Order History
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-sm">
            Manage and track your recent purchases, shipments, and receipts.
          </p>
        </header>

        <div className="space-y-6">
          {orders?.length === 0 ? (
            <div className="border border-dashed rounded-[2.5rem] p-16 text-center space-y-4 bg-white">
              <ShoppingBag
                size={56}
                className="mx-auto text-gray-300"
                strokeWidth={1.5}
              />
              <h3 className="text-xl font-bold text-gray-900">
                No orders placed yet
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Explore our catalog to find premium products and start shopping.
              </p>
              <Link href="/shop">
                <Button className="h-11 rounded-xl px-6 text-xs font-bold uppercase tracking-wider mt-2">
                  Browse Shop
                </Button>
              </Link>
            </div>
          ) : (
            orders?.map((order: any) => (
              <OrderCard key={order?.id} order={order} />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="p-10 rounded-[2.5rem] bg-blue-50/40 border border-blue-100 space-y-6">
            <h3 className="text-2xl font-serif text-blue-900">
              Need help with an order?
            </h3>
            <p className="text-sm text-blue-800/70 leading-relaxed font-medium">
              Our customer support is available 24/7 to assist with delivery
              updates, cancellations, or return requests.
            </p>
            <Link href="/contact">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:gap-4 transition-all"
              >
                Contact Support <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-gray-100 border border-gray-200 space-y-6">
            <h3 className="text-2xl font-serif text-gray-900">
              Direct Assistance
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Track your doorstep shipments and verify cash on delivery
              breakdown anytime.
            </p>
            <Link href="/shop">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:gap-4 transition-all"
              >
                Explore New Arrivals <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
