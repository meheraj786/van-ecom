"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Headphones,
  Loader2,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Tag,
  Truck,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

const ORDER_STEPS = [
  { key: "PENDING", label: "Order Placed", desc: "Received by system" },
  { key: "PROCESSING", label: "Processing", desc: "Packed & Prepared" },
  { key: "SHIPPED", label: "On The Way", desc: "Dispatched with courier" },
  { key: "DELIVERED", label: "Delivered", desc: "Package handed over" },
];

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const { primaryColor } = useThemeStore();
  const [searchInput, setSearchInput] = React.useState(initialOrderId);
  const [activeSearchId, setActiveSearchId] = React.useState(initialOrderId);

  const {
    data: orderResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["track-order", activeSearchId],
    queryFn: async () => {
      if (!activeSearchId.trim()) return null;
      const cleanId = activeSearchId
        .trim()
        .replace(/^#ORD-/i, "")
        .replace(/^#LX-/i, "");
      const { data } = await api.get(
        `/order/track/${encodeURIComponent(cleanId)}`,
      );
      return data?.data || data;
    },
    enabled: !!activeSearchId.trim(),
    retry: 1,
  });

  const order = orderResponse;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const cleanId = searchInput.trim();
    setActiveSearchId(cleanId);
    router.replace(`/track-order?orderId=${encodeURIComponent(cleanId)}`);
  };

  const getStepStatus = (stepKey: string, currentStatus = "PENDING") => {
    const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const normalizedStatus =
      currentStatus === "PAID" ? "PROCESSING" : currentStatus.toUpperCase();

    if (normalizedStatus === "CANCELLED") return "cancelled";

    const currentIndex = statusOrder.indexOf(normalizedStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="min-h-screen bg-[#fafafa] pt-32 pb-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white border shadow-xs"
          >
            Live Shipment Tracker
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 uppercase">
            Track Your Order
          </h1>
          <p className="text-xs text-gray-400 max-w-md mx-auto uppercase tracking-wider font-medium">
            Search with your full Order ID or 6-digit Reference Code (e.g.
            #ORD-96B6D5)
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="max-w-2xl mx-auto bg-white p-2 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              required
              placeholder="e.g. #ORD-96B6D5, 96B6D5, or full Order ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12 h-14 rounded-xl sm:rounded-2xl border-transparent focus:border-gray-200 bg-gray-50/60 font-mono text-xs sm:text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="h-14 px-8 rounded-xl sm:rounded-2xl bg-gray-900 text-white hover:bg-gray-800 font-black uppercase tracking-widest text-xs shadow-md shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              "Track Order"
            )}
          </Button>
        </form>

        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-gray-400" size={36} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Locating Shipment Status...
            </p>
          </div>
        )}

        {isError && (
          <div className="p-8 rounded-3xl bg-white border border-red-100 shadow-sm text-center space-y-3 max-w-md mx-auto animate-in fade-in duration-300">
            <AlertCircle size={40} className="mx-auto text-red-500" />
            <h3 className="font-bold text-base text-gray-900">
              Order Not Found
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No matching order found for reference &quot;{activeSearchId}
              &quot;. Please ensure you entered the correct Order ID or
              6-character code.
            </p>
          </div>
        )}

        {order && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-10 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Order Reference ID
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <h3 className="text-xl sm:text-2xl font-black font-mono text-gray-900">
                      #ORD-{order.id?.slice(-6).toUpperCase()}
                    </h3>
                    <span className="text-xs font-mono text-gray-400 bg-gray-50 border rounded-lg px-2 py-0.5">
                      Full ID: {order.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-4 py-1 text-xs font-black uppercase tracking-wider border shadow-xs",
                      order.status === "DELIVERED"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : order.status === "SHIPPED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : order.status === "CANCELLED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                    )}
                  >
                    {order.status === "PAID" ? "Processing" : order.status}
                  </Badge>
                </div>
              </div>

              {order.status === "CANCELLED" ? (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-4 text-red-800">
                  <XCircle size={32} className="text-red-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Order Cancelled</h4>
                    <p className="text-xs text-red-600/90 mt-0.5">
                      This shipment has been cancelled. Please contact customer
                      support for further assistance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
                  {ORDER_STEPS.map((step, idx) => {
                    const status = getStepStatus(step.key, order.status);
                    const isCompleted = status === "completed";
                    const isCurrent = status === "current";

                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center text-center space-y-3 relative z-10"
                      >
                        <div
                          className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-sm",
                            isCompleted
                              ? "bg-gray-900 text-white"
                              : isCurrent
                                ? "bg-gray-900 text-white ring-4 ring-gray-900/20 animate-pulse"
                                : "bg-gray-100 text-gray-400 border border-gray-200",
                          )}
                        >
                          {isCompleted ? (
                            <Check size={20} />
                          ) : (
                            <span className="text-xs">{idx + 1}</span>
                          )}
                        </div>

                        <div>
                          <p
                            className={cn(
                              "font-black text-xs uppercase tracking-wider",
                              isCompleted || isCurrent
                                ? "text-gray-900"
                                : "text-gray-400",
                            )}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <MapPin size={14} /> Shipping Destination
                  </div>
                  <p className="font-bold text-sm text-gray-900 leading-snug">
                    {order.shippingAddress}, {order.city}{" "}
                    {order.zipCode ? `(${order.zipCode})` : ""}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Division: {order.division?.name || "Standard Courier"}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <CreditCard size={14} /> Payment Breakdown
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Payment Method:</span>
                      <span className="font-bold text-gray-900">
                        Cash On Delivery (COD)
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Coupon Discount:</span>
                        <span>-৳{Number(order.discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-900 font-black pt-1 border-t border-gray-200">
                      <span>Total Amount:</span>
                      <span>৳{Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">
                  Package Items ({order.items?.length || 0})
                </span>

                <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                  {(order.items || []).map((item: any) => {
                    const snapshot = item.variantSnapshot || {};
                    const img =
                      snapshot.image ||
                      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=200";

                    return (
                      <div
                        key={item.id}
                        className="p-4 flex items-center justify-between gap-4 bg-white"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-50 border shrink-0">
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 line-clamp-1">
                              {snapshot.productName || "Product"}
                            </p>
                            {snapshot.options && (
                              <p className="text-[10px] text-gray-400 capitalize">
                                {Object.entries(snapshot.options)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400 font-medium">
                            Qty: {item.quantity} × ৳
                            {Number(item.price).toFixed(2)}
                          </p>
                          <p className="font-bold text-sm text-gray-900">
                            ৳{(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-gray-400" size={36} />
        </div>
      }
    >
      <TrackOrderContent />
    </React.Suspense>
  );
}
