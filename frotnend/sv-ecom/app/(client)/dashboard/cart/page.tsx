// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import {
//   CreditCard,
//   Minus,
//   Plus,
//   ShieldCheck,
//   ShoppingBag,
//   Truck,
//   X,
//   Loader2,
// } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import type { CSSProperties } from "react";
// import { useState } from "react";
// import {
//   useCart,
//   useAddToCart,
//   useRemoveFromCart,
//   useClearCart,
// } from "@/hooks/useCart";
// import { useProducts } from "@/hooks/useProducts";
// import { useCreateOrder } from "@/hooks/useOrders";
// import { Button } from "@/components/ui/button";
// import { useThemeStore } from "@/store/useThemeStore";

// interface CartUiItem {
//   id: string;
//   name: string;
//   image: string;
//   variant: string;
//   price: number;
//   quantity: number;
// }

// const CartItemRow = ({ item }: { item: CartUiItem }) => {
//   const addToCartMutation = useAddToCart();
//   const removeFromCartMutation = useRemoveFromCart();

//   const handleQuantityChange = (change: number) => {
//     if (item.quantity + change <= 0) {
//       removeFromCartMutation.mutate(item.id);
//     } else {
//       addToCartMutation.mutate({
//         productId: item.id,
//         quantity: change,
//         price: item.price,
//       });
//     }
//   };

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, x: -20 }}
//       className="group flex flex-col sm:flex-row items-center gap-6 py-8 border-b border-gray-100"
//     >
//       <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#f8f9fb]">
//         <Image
//           src={item.image}
//           alt={item.name}
//           fill
//           className="object-cover transition-transform group-hover:scale-105"
//         />
//       </div>

//       <div className="flex-1 flex flex-col sm:flex-row justify-between w-full gap-4">
//         <div className="space-y-1">
//           <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
//           <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
//             {item.variant}
//           </p>

//           <div className="flex items-center mt-4 rounded-full border border-gray-100 w-fit p-1 bg-white shadow-sm">
//             <button
//               type="button"
//               onClick={() => handleQuantityChange(-1)}
//               disabled={addToCartMutation.isPending}
//               className="p-1.5 hover:text-[var(--primary)] transition-colors disabled:opacity-50"
//             >
//               <Minus size={14} />
//             </button>
//             <span className="w-8 text-center text-sm font-bold">
//               {item.quantity}
//             </span>
//             <button
//               type="button"
//               onClick={() => handleQuantityChange(1)}
//               disabled={addToCartMutation.isPending}
//               className="p-1.5 hover:text-[var(--primary)] transition-colors disabled:opacity-50"
//             >
//               <Plus size={14} />
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-row sm:flex-col justify-between items-end">
//           <button
//             type="button"
//             onClick={() => removeFromCartMutation.mutate(item.id)}
//             className="p-2 text-gray-300 hover:text-red-500 transition-colors"
//           >
//             <X size={20} />
//           </button>
//           <p className="text-xl font-black" style={{ color: "var(--primary)" }}>
//             ${(item.price * item.quantity).toLocaleString()}
//           </p>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const CartPage = () => {
//   const router = useRouter();
//   const { primaryColor } = useThemeStore();
//   const { data: cartResponse, isLoading: isFetchingCart } = useCart();
//   const { data: productsResponse } = useProducts({ page: 1, limit: 100 });
//   const createOrderMutation = useCreateOrder();

//   const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

//   const productsMap = new Map(
//     productsResponse?.data?.products.map((p) => [p.id, p]) || [],
//   );

//   const items: CartUiItem[] =
//     cartResponse?.data?.items.map((item) => {
//       const productDetails = productsMap.get(item.productId);
//       return {
//         id: item.productId,
//         name: productDetails?.name || "Lumina Premium Product",
//         price: item.price,
//         quantity: item.quantity,
//         variant: "Standard",
//         image:
//           "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200",
//       };
//     }) || [];

//   const currentSubtotal = items.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0,
//   );
//   const shippingLimit = 2000;
//   const shippingProgress = Math.min(
//     (currentSubtotal / shippingLimit) * 100,
//     100,
//   );

//   const handleCheckout = async () => {
//     try {
//       await createOrderMutation.mutateAsync({});
//       router.push("/dashboard");
//     } catch (error) {
//       console.error("Checkout failed:", error);
//     }
//   };

//   if (isFetchingCart) {
//     return (
//       <div className="flex h-screen w-screen items-center justify-center bg-white">
//         <Loader2 className="animate-spin text-slate-400" size={32} />
//       </div>
//     );
//   }

//   return (
//     <div
//       style={dynamicStyles}
//       className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12"
//     >
//       <div className="max-w-[1440px] mx-auto">
//         <header className="mb-12 flex items-center justify-between">
//           <h1 className="text-5xl font-serif text-gray-900">Your Cart</h1>
//           <span className="bg-[#f8f9fb] px-4 py-1 rounded-full text-xs font-bold text-gray-500">
//             {items?.length} items
//           </span>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
//           <div className="lg:col-span-8">
//             <AnimatePresence mode="popLayout">
//               {items?.length > 0 ? (
//                 <div className="flex flex-col">
//                   {items.map((item) => (
//                     <CartItemRow key={item.id} item={item} />
//                   ))}

//                   <div className="mt-8 p-6 rounded-[2rem] bg-blue-50/30 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
//                         <ShieldCheck size={24} />
//                       </div>
//                       <div>
//                         <p className="font-bold text-gray-900">
//                           Add Luxe Care+
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           2 years of extended premium protection.
//                         </p>
//                       </div>
//                     </div>
//                     <Button
//                       variant="outline"
//                       className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
//                     >
//                       Add for $49
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-40">
//                   <div className="flex justify-center mb-6 text-gray-200">
//                     <ShoppingBag size={80} />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     Your cart is empty
//                   </h2>
//                   <Link
//                     href="/shop"
//                     className="mt-6 inline-block text-sm font-bold text-[var(--primary)] underline underline-offset-4"
//                   >
//                     Continue Shopping
//                   </Link>
//                 </div>
//               )}
//             </AnimatePresence>
//           </div>

//           <aside className="lg:col-span-4">
//             <div className="sticky top-32 space-y-6">
//               <div className="p-6 rounded-3xl bg-[#f8f9fb] space-y-3">
//                 <p className="text-xs font-bold text-gray-900 flex justify-between">
//                   {shippingProgress < 100 ? (
//                     <>
//                       Add{" "}
//                       <span>
//                         ${(shippingLimit - currentSubtotal).toLocaleString()}
//                       </span>{" "}
//                       more for free shipping
//                     </>
//                   ) : (
//                     "🎉 You've unlocked free express shipping!"
//                   )}
//                 </p>
//                 <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${shippingProgress}%` }}
//                     className="h-full bg-[var(--primary)]"
//                   />
//                 </div>
//               </div>

//               <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
//                 <h3 className="text-xl font-bold text-gray-900">
//                   Order Summary
//                 </h3>

//                 <div className="space-y-4">
//                   <div className="flex justify-between text-sm font-medium text-gray-500">
//                     <span>Subtotal</span>
//                     <span className="text-gray-900">
//                       ${currentSubtotal.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm font-medium text-gray-500">
//                     <span>Shipping</span>
//                     <span className="text-green-600 font-bold">Free</span>
//                   </div>
//                   {/* <div className="flex justify-between text-sm font-medium text-gray-500">
//                     <span>Estimated Tax</span>
//                     <span className="text-gray-900">$110.16</span>
//                   </div> */}
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <label
//                     htmlFor="promo-code"
//                     className="text-[10px] font-black uppercase tracking-widest text-gray-400"
//                   >
//                     Promo Code
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       placeholder="Enter code"
//                       className="flex-1 bg-gray-50 border-transparent rounded-xl px-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:bg-white transition-all outline-none"
//                     />
//                     <Button
//                       variant="outline"
//                       className="rounded-xl border-gray-200"
//                     >
//                       Apply
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="pt-4 flex justify-between items-end">
//                   <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
//                     Total
//                   </span>
//                   <span
//                     className="text-3xl font-black tracking-tight"
//                     style={{ color: "var(--primary)" }}
//                   >
//                     ${(currentSubtotal).toLocaleString()}
//                   </span>
//                 </div>

//                 <Button
//                   size="lg"
//                   onClick={handleCheckout}
//                   disabled={createOrderMutation.isPending || items?.length === 0}
//                   className="w-full h-16 rounded-2xl text-base font-black shadow-lg shadow-blue-100 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
//                 >
//                   {createOrderMutation.isPending ? (
//                     <Loader2 className="animate-spin" size={18} />
//                   ) : (
//                     "Proceed To Checkout"
//                   )}
//                 </Button>

//                 <div className="pt-4 flex justify-center items-center gap-6 grayscale opacity-40">
//                   <CreditCard size={24} />
//                   <Truck size={24} />
//                   <ShieldCheck size={24} />
//                 </div>
//                 <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">
//                   Secure checkout powered by Stripe
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl bg-blue-50/50 flex items-start gap-4">
//                 <Truck size={20} className="text-blue-600 mt-1" />
//                 <div className="text-[11px] leading-relaxed text-blue-900">
//                   <p className="font-bold">Free Express Delivery</p>
//                   <p className="opacity-70">
//                     Estimated arrival in 2-3 business days. Reliable and fully
//                     insured.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Separator = () => <div className="h-px w-full bg-gray-100" />;

// export default CartPage;

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
