"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Headphones,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Tag,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AdminOverviewDashboard() {
  const { primaryColor } = useThemeStore();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-overview-orders"],
    queryFn: async () => {
      const { data } = await api.get("/order", {
        params: { all: "true", page: 1, limit: 6 },
      });
      return data;
    },
  });

  const { data: stocksData, isLoading: stocksLoading } = useQuery({
    queryKey: ["admin-overview-stocks"],
    queryFn: async () => {
      const { data } = await api.get("/inventory/stocks", {
        params: { page: 1, limit: 100 },
      });
      return data;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-overview-products"],
    queryFn: async () => {
      const { data } = await api.get("/product", {
        params: { page: 1, limit: 5, sortBy: "newest" },
      });
      return data;
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["admin-overview-reviews"],
    queryFn: async () => {
      const { data } = await api.get("/review", {
        params: { page: 1, limit: 4 },
      });
      return data;
    },
  });

  const ordersList = ordersData?.orders || ordersData?.data?.orders || [];
  const totalOrdersCount = ordersData?.meta?.totalOrders || ordersList?.length;

  const totalRevenue = React.useMemo(() => {
    return ordersList.reduce(
      (sum: number, o: any) => sum + (Number(o.totalAmount) || 0),
      0,
    );
  }, [ordersList]);

  const stockItems = stocksData?.stocks || stocksData?.data?.stocks || [];

  const lowStockCount = React.useMemo(() => {
    return stockItems.filter((s: any) => Number(s.quantityRemaining || 0) <= 5)
      ?.length;
  }, [stockItems]);

  const productsList = productsData?.items || productsData?.data?.items || [];

  const reviewsList = reviewsData?.reviews || [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            Executive Overview
          </h1>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">
            Real-time commercial analytics and store performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button className="h-11 rounded-xl px-5 text-xs font-black uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 shadow-md shadow-gray-200">
              <Plus size={16} className="mr-1.5" /> New Product
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: "Gross Revenue",
            value: `৳${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            badge: "+18.2%",
            badgeColor: "bg-emerald-50 text-emerald-700",
            icon: CreditCard,
          },
          {
            label: "Total Orders",
            value: totalOrdersCount.toString(),
            badge: "Active",
            badgeColor: "bg-blue-50 text-blue-700",
            icon: ShoppingBag,
          },
          {
            label: "Low Stock Alert",
            value: lowStockCount.toString(),
            badge: lowStockCount > 0 ? "Action Required" : "Healthy",
            badgeColor:
              lowStockCount > 0
                ? "bg-rose-50 text-rose-700"
                : "bg-gray-50 text-gray-500",
            icon: lowStockCount > 0 ? AlertTriangle : Warehouse,
          },
          {
            label: "Active Products",
            value: (
              productsData?.meta?.total || productsList?.length
            ).toString(),
            badge: "Catalog",
            badgeColor: "bg-purple-50 text-purple-700",
            icon: Package,
          },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-800">
                <kpi.icon size={20} />
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
                  kpi.badgeColor,
                )}
              >
                {kpi.badge}
              </Badge>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {kpi.label}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
                {kpi.value}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <section className="xl:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden space-y-2">
          <div className="p-7 pb-4 flex justify-between items-center border-b border-gray-50">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">
                Recent Orders
              </h3>
              <p className="text-xs text-gray-400">Latest customer checkouts</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline uppercase tracking-wider"
            >
              All Orders <ChevronRight size={14} />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="animate-spin text-gray-300" size={28} />
            </div>
          ) : ordersList?.length === 0 ? (
            <div className="py-20 text-center text-xs font-bold text-gray-400">
              No orders placed yet.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest px-6">
                    Order Ref
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Customer
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Amount
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-6">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersList.map((order: any) => {
                  const formattedDate = new Date(
                    order.createdAt,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="px-6 font-mono font-bold text-xs text-gray-900">
                        #ORD-{order.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-gray-700">
                        {order.shippingAddress || "Customer"}
                      </TableCell>
                      <TableCell className="text-xs font-black text-gray-900">
                        ৳{Number(order.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border",
                            order.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : order.status === "DELIVERED"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6 text-xs text-gray-400 font-mono">
                        {formattedDate}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>

        <section className="xl:col-span-4 space-y-6">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Support Station
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight leading-tight">
                Live Concierge
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Connect and answer live inquiries from customers in real-time.
              </p>
            </div>

            <Link href="/admin/support" className="block pt-2">
              <Button className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-wider bg-white text-gray-900 hover:bg-gray-100">
                <Headphones size={15} className="mr-2" /> Open Chat Inbox
              </Button>
            </Link>
          </div>

          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                Recent Reviews
              </h4>
              <Link
                href="/admin/reviews"
                className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {reviewsList?.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No reviews submitted yet.
                </p>
              ) : (
                reviewsList.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-2xl bg-gray-50/60 border border-gray-100/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900 truncate max-w-[140px]">
                        {rev.userName}
                      </span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={10}
                            className={
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-[11px] text-gray-500 line-clamp-1 italic">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
