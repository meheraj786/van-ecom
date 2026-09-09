"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight,
  CreditCard,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators";
import { useCart } from "@/hooks/useCart";
import { useAuthStore } from "@/store/useAuthStore";
import { useDivisions, useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useThemeStore } from "@/store/useThemeStore";
import { useValidateCoupon } from "@/hooks/useCoupon";
import { CartItem, Division, User } from "@/types";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get("couponCode") || "";

  const { primaryColor } = useThemeStore();
  const { user } = useAuthStore();
  const { items, clearCart } = useCart();

  const { data: divisions = [], isLoading: divisionsLoading } = useDivisions();
  const createOrderMutation = useCreateOrder();
  const validateCouponMutation = useValidateCoupon();

  const [paymentMethod, setPaymentMethod] = React.useState<
    "COD" | "SSLCOMMERZ"
  >("COD");
  const [promoCodeInput, setPromoCodeInput] = React.useState(initialCoupon);
  const [appliedCouponCode, setAppliedCouponCode] =
    React.useState(initialCoupon);
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [couponError, setCouponError] = React.useState("");
  const [orderError, setOrderError] = React.useState("");
  const [orderSuccess, setOrderSuccess] = React.useState(false);
  const [createdOrderId, setCreatedOrderId] = React.useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      divisionId: "",
      paymentMethod: "COD",
      couponCode: initialCoupon || undefined,
      billing: {
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        country: "Bangladesh",
      },
    },
  });

  const selectedDivisionId = watch("divisionId");
  const selectedDivision = Array.isArray(divisions)
    ? divisions.find((d) => d.id === selectedDivisionId)
    : undefined;
  const deliveryCharge = selectedDivision?.deliveryCharge ?? 0;

  const subtotal = React.useMemo(() => {
    return items.reduce((sum: number, item: CartItem) => {
      const p = item.price || 0;
      return sum + p * item.quantity;
    }, 0);
  }, [items]);

  const totalAmount = Math.max(0, subtotal - appliedDiscount + deliveryCharge);

  const applyCouponCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setCouponError("");
    try {
      const res = await validateCouponMutation.mutateAsync({
        userId: user?.id || (user as User)?.userId || "GUEST",
        code: cleanCode,
        items: items.map((i: CartItem) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      const couponData = res?.data || res;
      const discount = couponData?.discountAmount || 0;

      setAppliedDiscount(discount);
      setAppliedCouponCode(couponData?.code || cleanCode);
      setValue("couponCode", couponData?.code || cleanCode);
      setPromoCodeInput("");
    } catch (error: any) {
      setCouponError(
        error?.response?.data?.message ||
          error?.message ||
          "Invalid promo code",
      );
      setAppliedDiscount(0);
      setAppliedCouponCode("");
      setValue("couponCode", undefined);
    }
  };

  React.useEffect(() => {
    if (initialCoupon && items?.length > 0) {
      applyCouponCode(initialCoupon);
    }
  }, [initialCoupon, items?.length]);

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCouponCode("");
    setValue("couponCode", undefined);
    setCouponError("");
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    setOrderError("");
    if (items?.length === 0) {
      router.push("/cart");
      return;
    }

    try {
      const res = await createOrderMutation.mutateAsync({
        divisionId: values.divisionId,
        couponCode: appliedCouponCode || undefined,
        customerId: user?.id || (user as User)?.userId || "GUEST",
        paymentMethod: paymentMethod,
        billing: values.billing,
        items: items.map((i: CartItem) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
          name: i.name || i.productName || "",
          image: i.image || "",
          sku: i.sku || "",
          slug: i.slug || i.productSlug || "",
          options: i.options || {},
        })),
      });

      const orderData = res.order;
      const gatewayUrl = res.gatewayUrl;

      if (gatewayUrl && paymentMethod === "SSLCOMMERZ") {
        window.location.href = gatewayUrl;
        return;
      }

      clearCart();
      setCreatedOrderId(orderData?.id || "");
      setOrderSuccess(true);
    } catch (error: any) {
      const rawMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to place order. Please try again.";

      let cleanMessage = rawMessage;
      if (typeof rawMessage === "string" && rawMessage.includes("{")) {
        try {
          const parsed = JSON.parse(
            rawMessage.substring(rawMessage.indexOf("{")),
          );
          cleanMessage = parsed.message || parsed.error || rawMessage;
        } catch {}
      }

      setOrderError(cleanMessage);
    }
  };

  if (orderSuccess) {
    return (
      <div className="bg-white min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex justify-center text-green-600">
            <CheckCircle2 size={80} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
              Order Confirmed!
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>
          </div>
          {createdOrderId && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-mono text-gray-600">
              Order Reference ID:{" "}
              <span className="font-bold text-gray-900">{createdOrderId}</span>
            </div>
          )}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/shop")}
              className="h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Continue Shopping
            </Button>
            {user && (
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/orders")}
                className="h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                View My Orders
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (items?.length === 0) {
    return (
      <div className="bg-white min-h-screen pt-32 flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag size={64} className="text-gray-300" />
        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          Your cart is empty
        </h2>
        <Button onClick={() => router.push("/shop")} className="rounded-xl">
          Return to Shop
        </Button>
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
          <Link
            href="/cart"
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Cart
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900">Checkout</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-10">
        {orderError && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in duration-300">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
            <div className="text-xs space-y-1">
              <p className="font-bold uppercase tracking-wider text-red-800">
                Order Failed
              </p>
              <p className="font-medium leading-relaxed">{orderError}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start"
        >
          <div className="lg:col-span-7 space-y-8">
            <Card className="rounded-[2rem] border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                  1. Shipping & Delivery Address
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wider text-gray-400">
                  Where should we send your package?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="font-bold text-gray-700"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. John Doe"
                      className="h-12 rounded-xl"
                      {...register("billing.fullName")}
                    />
                    {errors.billing?.fullName && (
                      <p className="text-xs text-red-500 font-bold">
                        {errors.billing.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold text-gray-700">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="e.g. +880 1700 000000"
                      className="h-12 rounded-xl"
                      {...register("billing.phone")}
                    />
                    {errors.billing?.phone && (
                      <p className="text-xs text-red-500 font-bold">
                        {errors.billing.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. john@example.com"
                    className="h-12 rounded-xl"
                    {...register("billing.email")}
                  />
                  {errors.billing?.email && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.billing.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="font-bold text-gray-700">
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    placeholder="House, road, landmark..."
                    className="h-12 rounded-xl"
                    {...register("billing.address")}
                  />
                  {errors.billing?.address && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.billing.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-bold text-gray-700">
                      City *
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g. Dhaka"
                      className="h-12 rounded-xl"
                      {...register("billing.city")}
                    />
                    {errors.billing?.city && (
                      <p className="text-xs text-red-500 font-bold">
                        {errors.billing.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="zipCode"
                      className="font-bold text-gray-700"
                    >
                      Zip / Postal Code
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="1200"
                      className="h-12 rounded-xl"
                      {...register("billing.zipCode")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="font-bold text-gray-700"
                    >
                      Country
                    </Label>
                    <Input
                      id="country"
                      disabled
                      value="Bangladesh"
                      className="h-12 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label className="font-bold text-gray-700">
                    Delivery Division *
                  </Label>
                  <Controller
                    control={control}
                    name="divisionId"
                    render={({ field }) => {
                      const divisionList = divisions;
                      return (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-gray-200 font-medium">
                            <SelectValue placeholder="Select your division" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {divisionsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading divisions...
                              </SelectItem>
                            ) : divisionList?.length === 0 ? (
                              <SelectItem value="empty" disabled>
                                No divisions configured
                              </SelectItem>
                            ) : (
                              divisionList.map((d) => (
                                <SelectItem
                                  key={d.id}
                                  value={d.id}
                                  className="cursor-pointer"
                                >
                                  {d.name} — ৳
                                  {Number(d.deliveryCharge || 0).toFixed(2)}{" "}
                                  delivery charge
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors.divisionId && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.divisionId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                  2. Payment Method
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wider text-gray-400">
                  Choose how you want to pay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between border-2 transition-all ${
                    paymentMethod === "COD"
                      ? "border-gray-900 bg-gray-50/80 shadow-sm"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs text-gray-900">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Pay with cash upon receiving your items
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "COD"
                        ? "border-gray-900"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "COD" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                    )}
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("SSLCOMMERZ")}
                  className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between border-2 transition-all ${
                    paymentMethod === "SSLCOMMERZ"
                      ? "border-gray-900 bg-gray-50/80 shadow-sm"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs text-blue-600">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        Online Payment (Cards / MFS)
                        <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">
                          SSLCommerz
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        bKash, Nagad, Rocket, Visa, Mastercard, Internet Banking
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "SSLCOMMERZ"
                        ? "border-gray-900"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "SSLCOMMERZ" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/60">
              <CardHeader>
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                  Order Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  {items?.length} items in cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const key = item.variantId || item.productId;
                    return (
                      <div
                        key={key}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-50 border shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <ShoppingBag
                                className="m-auto text-gray-300"
                                size={20}
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 line-clamp-1">
                              {item.name}
                            </p>
                            {item.options &&
                            Object.keys(item.options)?.length > 0 ? (
                              <p className="text-[11px] text-gray-400 capitalize">
                                {Object.entries(item.options)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(", ")}
                              </p>
                            ) : null}
                            <p className="text-xs text-gray-500 font-medium">
                              Qty: {item.quantity} × ৳
                              {Number(item.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-gray-900">
                          ৳
                          {(Number(item.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Promo Code
                  </Label>
                  {appliedCouponCode ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700">
                          {appliedCouponCode} (-৳{appliedDiscount.toFixed(2)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. SAVE10"
                          value={promoCodeInput}
                          onChange={(e) => {
                            setPromoCodeInput(e.target.value);
                            if (couponError) setCouponError("");
                          }}
                          className="h-11 rounded-xl uppercase text-xs font-mono font-bold"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            validateCouponMutation.isPending ||
                            !promoCodeInput.trim()
                          }
                          onClick={() => applyCouponCode(promoCodeInput)}
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

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Discount</span>
                      <span className="font-bold">
                        -৳{appliedDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-gray-900">
                      {selectedDivision
                        ? `৳${Number(deliveryCharge).toFixed(2)}`
                        : "Select division"}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between items-end border-t">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Total
                    </span>
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                      ৳{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    createOrderMutation.isPending || !selectedDivisionId
                  }
                  className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 bg-gray-900 text-white hover:bg-gray-800"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      {paymentMethod === "SSLCOMMERZ"
                        ? "Redirecting to Payment..."
                        : "Placing Order..."}
                    </>
                  ) : paymentMethod === "SSLCOMMERZ" ? (
                    "Proceed to Payment"
                  ) : (
                    "Place Order Now"
                  )}
                </Button>

                <div className="pt-2 flex justify-center items-center gap-6 text-gray-300">
                  <CreditCard size={22} />
                  <Truck size={22} />
                  <ShieldCheck size={22} />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
