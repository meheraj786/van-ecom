// import { useAuthStore } from "@/store/useAuthStore";
// import {
//   useCart,
//   useAddToCart,
//   useRemoveFromCart,
//   useClearCart,
// } from "@/hooks/useCart";
// import { useCartStore } from "@/store/useCartStore";

// export function useHybridCart() {
//   const { isAuthenticated } = useAuthStore();

//   const { data: dbCart, isLoading: isFetchingDb } = useCart();
//   const addToDbCart = useAddToCart();
//   const removeFromDbCart = useRemoveFromCart();
//   const clearDbCart = useClearCart();

//   const guestCart = useCartStore();

//   const items = isAuthenticated
//     ? dbCart?.data?.items.map((item) => ({
//         // prefer variantId when available
//         id: item.variantId ?? item.productId,
//         variantId: item.variantId,
//         name: "e-com Premium Product",
//         price: item.price,
//         quantity: item.quantity,
//         image:
//           "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200",
//         variant: "Standard",
//       })) || []
//     : guestCart.items;

//   const subtotal = items.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0,
//   );

//   const handleAdd = async (id: string, quantity: number, price: number) => {
//     if (isAuthenticated) {
//       // keep sending productId for now for backward compatibility
//       await addToDbCart.mutateAsync({ productId: id, quantity, price });
//     } else {
//       guestCart.addItem({
//         id,
//         name: "e-com Premium Product",
//         price,
//         quantity,
//         image:
//           "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200",
//         variant: "Standard",
//       });
//     }
//   };

//   const handleRemove = async (id: string) => {
//     if (isAuthenticated) {
//       await removeFromDbCart.mutateAsync(id);
//     } else {
//       guestCart.removeItem(id);
//     }
//   };

//   const handleUpdateQuantity = async (id: string, change: number) => {
//     const item = items.find((i) => i.id === id);
//     if (!item) return;

//     const newQty = item.quantity + change;
//     if (newQty <= 0) {
//       await handleRemove(id);
//     } else {
//       if (isAuthenticated) {
//         await addToDbCart.mutateAsync({
//           productId: id,
//           quantity: change,
//           price: item.price,
//         });
//       } else {
//         guestCart.updateQuantity(id, change);
//       }
//     }
//   };

//   const handleClear = async () => {
//     if (isAuthenticated) {
//       await clearDbCart.mutateAsync();
//     } else {
//       guestCart.clearCart();
//     }
//   };

//   return {
//     items,
//     subtotal,
//     isLoading: isAuthenticated ? isFetchingDb : false,
//     addItem: handleAdd,
//     removeItem: handleRemove,
//     updateQuantity: handleUpdateQuantity,
//     clearCart: handleClear,
//   };
// }
