"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
  Tag,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
  const { primaryColor } = useThemeStore();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const items = order.items || [];
  const previewImages = items
    .map((item: any) => item.variantSnapshot?.image)
    .filter(Boolean)
    .slice(0, 3);

  const moreCount = items?.length > 3 ? items?.length - 3 : 0;

  const status = (order.status || "PENDING").toUpperCase();

  const getStatusBadge = () => {
    switch (status) {
      case "DELIVERED":
        return {
          icon: <Check size={12} className="mr-1.5" />,
          label: "Delivered",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "SHIPPED":
        return {
          icon: <Truck size={12} className="mr-1.5" />,
          label: "On the way",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "PAID":
        return {
          icon: <Clock size={12} className="mr-1.5 animate-pulse" />,
          label: "Confirmed",
          className: "bg-teal-50 text-teal-700 border-teal-200",
        };
      case "CANCELLED":
        return {
          icon: <XCircle size={12} className="mr-1.5" />,
          label: "Cancelled",
          className: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          icon: <Clock size={12} className="mr-1.5 animate-pulse" />,
          label: "Processing",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-[2rem] border border-gray-100/80 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 hover:border-gray-200/80 transition-all duration-300 space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">
              Order Reference
            </span>
            <span className="font-mono font-black text-base text-gray-900 mt-0.5 block">
              #ORD-{order.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="hidden sm:block h-7 w-px bg-gray-100 mx-1" />

          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">
              Date Placed
            </span>
            <span className="text-xs font-bold text-gray-600 mt-0.5 block">
              {formattedDate}
            </span>
          </div>

          <div className="hidden sm:block h-7 w-px bg-gray-100 mx-1" />

          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">
              Total Amount
            </span>
            <span
              className="text-base font-black tracking-tight mt-0.5 block"
              style={{ color: primaryColor }}
            >
              ৳{Number(order.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-wider border shadow-xs",
              statusInfo.className,
            )}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 overflow-hidden">
            {previewImages.map((img: string, idx: number) => (
              <div
                key={idx}
                className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-50 border-2 border-white shadow-sm shrink-0"
              >
                <Image src={img} alt="Product" fill className="object-cover" />
              </div>
            ))}

            {moreCount > 0 && (
              <div className="relative h-14 w-14 rounded-2xl border-2 border-white shadow-sm bg-gray-50 flex items-center justify-center text-xs font-black text-gray-500 shrink-0">
                +{moreCount}
              </div>
            )}
          </div>

          <div className="space-y-0.5 pl-1">
            <p className="font-bold text-sm text-gray-900">
              {items?.length} {items?.length === 1 ? "Product" : "Products"}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[240px]">
              {items[0]?.variantSnapshot?.productName || "Ordered Items"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full md:w-auto h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] bg-gray-900 text-white hover:bg-gray-800 shadow-md shadow-gray-200 transition-all flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <>
              Hide Details <ChevronUp size={14} />
            </>
          ) : (
            <>
              Order Details <ChevronDown size={14} />
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden space-y-6 pt-4 border-t border-gray-100"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">
                Purchased Variations
              </span>
              <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                {items.map((item: any) => {
                  const snapshot = item.variantSnapshot || {};
                  const img =
                    snapshot.image ||
                    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=200";

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-50 border shrink-0">
                          <Image
                            src={img}
                            alt="Product"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-gray-900 line-clamp-1">
                            {snapshot.productName || "Product"}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {snapshot.options &&
                              Object.entries(snapshot.options).map(
                                ([opt, val]) => (
                                  <Badge
                                    key={opt}
                                    variant="secondary"
                                    className="text-[9px] font-medium py-0 px-1.5 bg-gray-100 text-gray-700 capitalize"
                                  >
                                    {opt}: {String(val)}
                                  </Badge>
                                ),
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-gray-400 block">
                          Qty: {item.quantity} × ৳
                          {Number(item.price).toFixed(2)}
                        </span>
                        <span className="font-bold text-sm text-gray-900">
                          ৳{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-xs">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block">
                  Delivery Destination
                </span>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 leading-snug">
                      {order.shippingAddress}, {order.city}{" "}
                      {order.zipCode ? `(${order.zipCode})` : ""}
                    </p>
                    <p className="text-blue-600 font-semibold mt-0.5">
                      {order.division?.name || "Standard Delivery"} (৳
                      {order.division?.deliveryCharge || 0})
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:border-l sm:pl-5 sm:border-gray-200">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block">
                  Financial Breakdown
                </span>
                <div className="space-y-1 text-gray-600">
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag size={11} /> Coupon Discount (
                        {order.couponCode || "APPLIED"})
                      </span>
                      <span>-৳{Number(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-900 font-black pt-1 border-t border-gray-200">
                    <span>Grand Total</span>
                    <span>৳{Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
