"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Tag,
  Truck,
} from "lucide-react";
import { useOrderById, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { primaryColor } = useThemeStore();

  const { data: orderResponse, isLoading } = useOrderById(orderId);
  const updateStatusMutation = useUpdateOrderStatus();

  const order: any = (orderResponse as any)?.data || orderResponse;

  const handleStatusChange = async (newStatus: string) => {
    if (!order?.id) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  if (!order || !order.id) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package size={64} className="text-gray-300" />
        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          Order Not Found
        </h2>
        <Button
          onClick={() => router.push("/admin/orders")}
          className="rounded-xl"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const initials = (order.customerName || "Customer")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const itemsSubtotal = (order.items || []).reduce(
    (acc: number, item: any) => acc + (item.price || 0) * item.quantity,
    0,
  );

  const deliveryCharge = order.division?.deliveryCharge || 0;
  const discountAmount = order.discountAmount || 0;
  const grandTotal = Number(order.totalAmount || 0);

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="space-y-10 animate-in fade-in duration-700 pb-20"
    >
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <header className="no-print flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b pb-6">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <Link
              href="/admin/orders"
              className="hover:text-[var(--primary)] transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Orders
            </Link>
            <ChevronRight size={10} />
            <span className="text-gray-900">
              #ORD-{order.id.slice(-6).toUpperCase()}
            </span>
          </nav>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
              Order #ORD-{order.id.slice(-6).toUpperCase()}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-widest",
                order.status === "PAID"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : order.status === "DELIVERED"
                    ? "bg-purple-50 text-purple-600 border-purple-200"
                    : order.status === "CANCELLED"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-amber-50 text-amber-600 border-amber-200",
              )}
            >
              {order.status}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border rounded-2xl p-1 px-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Status:
            </span>
            <Select
              value={order.status}
              onValueChange={handleStatusChange}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[140px] h-9 border-none bg-transparent font-bold text-xs focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="font-bold text-xs"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-11 rounded-xl px-5 border-gray-200 font-bold text-gray-600"
          >
            <Printer size={16} className="mr-2" /> Print Invoice
          </Button>
        </div>
      </header>

      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-[#fcfcfc] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 uppercase text-[11px] tracking-[0.2em]">
                Items Purchased
              </h3>
              <Badge
                variant="secondary"
                className="rounded-full px-3 font-bold text-[10px]"
              >
                {order.items?.length || 0} Items
              </Badge>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Product
                    </th>
                    <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      SKU
                    </th>
                    <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Quantity
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items?.map((item: any) => {
                    const snapshot = item.variantSnapshot || {};
                    const itemImg =
                      snapshot.image ||
                      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=200";

                    return (
                      <tr
                        key={item.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                              <Image
                                src={itemImg}
                                alt="Product"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {snapshot.productName || "Product"}
                              </p>
                              {snapshot.options &&
                              Object.keys(snapshot.options)?.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(snapshot.options).map(
                                    ([k, v]) => (
                                      <Badge
                                        key={k}
                                        variant="secondary"
                                        className="text-[9px] font-normal py-0 px-1.5 bg-gray-100"
                                      >
                                        <span className="text-gray-400 mr-1">
                                          {k}:
                                        </span>
                                        {String(v)}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 font-mono text-xs text-gray-500 font-bold">
                          {snapshot.sku ||
                            item.variantId.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-5 font-bold text-sm text-gray-900">
                          × {item.quantity}
                        </td>
                        <td className="px-8 py-5 text-right font-black text-gray-900 text-sm">
                          ৳{(Number(item.price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
            <h3 className="font-bold text-gray-900 uppercase text-[11px] tracking-[0.2em] border-b pb-4">
              Payment & Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ৳{itemsSubtotal.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> Coupon ({order.couponCode || "APPLIED"})
                    </span>
                    <span className="font-bold">
                      -৳{discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Delivery ({order.division?.name || "Standard"})
                  </span>
                  <span className="font-bold text-gray-900">
                    {deliveryCharge > 0
                      ? `৳${deliveryCharge.toFixed(2)}`
                      : "Free"}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-end pt-2">
                  <span className="text-lg font-black text-gray-900 uppercase tracking-tight">
                    Total Amount
                  </span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    ৳{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
                    <CreditCard size={16} />
                    <span>Payment Method</span>
                  </div>
                  <Badge className="bg-blue-600 text-white text-[9px] font-black uppercase">
                    Cash on Delivery
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Payment is to be collected upon doorstep delivery.
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  Authorized: {formattedDate}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest border-b pb-4">
              Shipping & Recipient Details
            </h3>

            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 rounded-2xl border bg-blue-50">
                <AvatarFallback className="font-black text-blue-600 text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {order.customerName || "Customer Name"}
                </p>
                <Badge
                  variant="secondary"
                  className="text-[9px] font-bold uppercase mt-0.5"
                >
                  {order.userId && order.userId !== "GUEST"
                    ? "Registered User"
                    : "Guest Checkout"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="text-gray-400 mt-0.5 shrink-0" size={15} />
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px]">
                    Email Address
                  </p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {order.customerEmail || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-gray-400 mt-0.5 shrink-0" size={15} />
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px]">
                    Phone Number
                  </p>
                  <p className="font-mono font-bold text-gray-900 mt-0.5">
                    {order.customerPhone || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-0.5 shrink-0" size={15} />
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px]">
                    Shipping Address
                  </p>
                  <p className="font-semibold text-gray-900 mt-0.5 leading-relaxed">
                    {order.shippingAddress}, {order.city}{" "}
                    {order.zipCode ? `(${order.zipCode})` : ""}
                  </p>
                  <p className="text-blue-600 font-bold text-[11px] mt-1">
                    Division: {order.division?.name || "Standard"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">
              Order Timeline
            </h3>

            <div className="space-y-6 pl-2 relative">
              <div className="absolute left-[13px] top-2 bottom-2 w-px bg-gray-100" />
              <div className="relative flex gap-4">
                <div className="mt-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-50 z-10 shrink-0" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-gray-900">{order.status}</p>
                  <p className="text-gray-400">
                    Order placed and stored with snapshot
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-1">
                    <Clock size={10} /> {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div
        id="printable-invoice"
        className="hidden font-sans space-y-6 text-black bg-white"
      >
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              STORE INVOICE
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Official Purchase Receipt & Tax Breakdown
            </p>
          </div>
          <div className="text-right text-xs space-y-1">
            <p className="font-bold text-base">
              Invoice #ORD-{order.id.slice(-6).toUpperCase()}
            </p>
            <p className="text-gray-600">Date: {formattedDate}</p>
            <p className="font-bold text-gray-900">Status: {order.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-4 border-b border-gray-200 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-gray-500 block mb-1">
              Billed & Shipped To:
            </span>
            <p className="font-bold text-base text-gray-900">
              {order.customerName}
            </p>
            <p className="text-gray-700 mt-1">
              {order.shippingAddress}, {order.city}{" "}
              {order.zipCode ? `- ${order.zipCode}` : ""}
            </p>
            <p className="text-gray-700">
              Division: {order.division?.name || "Standard"}
            </p>
            <p className="text-gray-700">Phone: {order.customerPhone}</p>
            <p className="text-gray-700">Email: {order.customerEmail}</p>
          </div>
          <div className="text-right">
            <span className="font-bold uppercase tracking-wider text-gray-500 block mb-1">
              Payment Information:
            </span>
            <p className="font-bold text-gray-900">
              Method: Cash on Delivery (COD)
            </p>
            <p className="text-gray-600">Currency: BDT (৳)</p>
            <p className="text-gray-600">
              Fulfillment: Standard Doorstep Delivery
            </p>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="py-3 font-bold uppercase tracking-wider">
                Item Description
              </th>
              <th className="py-3 font-bold uppercase tracking-wider">SKU</th>
              <th className="py-3 font-bold uppercase tracking-wider text-center">
                Qty
              </th>
              <th className="py-3 font-bold uppercase tracking-wider text-right">
                Unit Price
              </th>
              <th className="py-3 font-bold uppercase tracking-wider text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items?.map((item: any) => {
              const snapshot = item.variantSnapshot || {};
              return (
                <tr key={item.id}>
                  <td className="py-3.5">
                    <p className="font-bold text-gray-900">
                      {snapshot.productName || "Product"}
                    </p>
                    {snapshot.options &&
                    Object.keys(snapshot.options)?.length > 0 ? (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {Object.entries(snapshot.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3.5 font-mono text-gray-600">
                    {snapshot.sku || item.variantId.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3.5 text-center font-bold">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right">
                    ৳{Number(item.price).toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right font-bold">
                    ৳{(Number(item.price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t-2 border-gray-900">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">
                ৳{itemsSubtotal.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({order.couponCode || "COUPON"}):</span>
                <span className="font-bold">-৳{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge:</span>
              <span className="font-bold text-gray-900">
                ৳{deliveryCharge.toFixed(2)}
              </span>
            </div>
            <Separator className="bg-gray-400" />
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
              <span>Total Payable:</span>
              <span>৳{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="pt-12 text-center text-[10px] text-gray-500 border-t border-gray-200">
          <p>
            Thank you for choosing our store. For any inquiries, please contact
            our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
