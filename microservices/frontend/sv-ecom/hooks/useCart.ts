import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cartService,
  type AddToCartPayload,
  type UpdateQuantityPayload,
} from "@/services/cartService";
import { useCartStore, type CartItem } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export function useCartCount(): number {
  const user = useAuthStore((state) => state?.user);
  const isLoggedIn = Boolean(user);

  const guestItems = useCartStore((state) => state?.items);

  const guestCount = React.useMemo(() => {
    if (!Array.isArray(guestItems)) return 0;
    return guestItems.reduce((acc, i) => acc + (Number(i?.quantity) || 0), 0);
  }, [guestItems]);

  const { data: serverCart } = useQuery({
    queryKey: ["server-cart"],
    queryFn: () => cartService.getCart(),
    enabled: isLoggedIn,
    staleTime: 1000 * 30,
  });

  const serverItems = React.useMemo(() => {
    if (!serverCart) return [];
    if (Array.isArray(serverCart)) return serverCart;
    if (Array.isArray((serverCart as any)?.data?.items))
      return (serverCart as any).data.items;
    if (Array.isArray((serverCart as any)?.items))
      return (serverCart as any).items;
    if (Array.isArray((serverCart as any)?.data))
      return (serverCart as any).data;
    return [];
  }, [serverCart]);

  if (isLoggedIn && serverItems?.length > 0) {
    return serverItems.reduce(
      (acc: number, i: any) => acc + (Number(i?.quantity) || 0),
      0,
    );
  }

  return Number(guestCount) || 0;
}

export function useCart() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state?.user);
  const isLoggedIn = Boolean(user);

  const guestCart = useCartStore();
  const guestItems: any[] = Array.isArray(guestCart?.items)
    ? guestCart.items
    : [];

  const { data: serverCart, isLoading: isServerLoading } = useQuery({
    queryKey: ["server-cart"],
    queryFn: () => cartService.getCart(),
    enabled: isLoggedIn,
  });

  const addToCartMutation = useMutation({
    mutationFn: (payload: any) => cartService.addToCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server-cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (payload: UpdateQuantityPayload) =>
      cartService.updateQuantity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server-cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (variantId: string) => cartService.removeFromCart(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server-cart"] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server-cart"] });
    },
  });

  const addItem = async (item: CartItem) => {
    if (guestCart?.addItem) {
      guestCart.addItem(item);
    }

    if (isLoggedIn) {
      try {
        await addToCartMutation.mutateAsync({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image,
          sku: item.sku,
          options: item.options,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    if (guestCart?.updateQuantity) {
      guestCart.updateQuantity(variantId, quantity);
    }

    if (isLoggedIn) {
      try {
        await updateQuantityMutation.mutateAsync({ variantId, quantity });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeItem = async (variantId: string) => {
    if (guestCart?.removeItem) {
      guestCart.removeItem(variantId);
    }

    if (isLoggedIn) {
      try {
        await removeFromCartMutation.mutateAsync(variantId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clearCart = async () => {
    if (guestCart?.clearCart) {
      guestCart.clearCart();
    }

    if (isLoggedIn) {
      try {
        await clearCartMutation.mutateAsync();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const syncGuestCartToServer = async () => {
    if (!isLoggedIn || guestItems?.length === 0) return;

    for (const item of guestItems) {
      try {
        await cartService.addToCart({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image,
          sku: item.sku,
          options: item.options,
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (guestCart?.clearCart) {
      guestCart.clearCart();
    }
    queryClient.invalidateQueries({ queryKey: ["server-cart"] });
  };

  const serverItems = React.useMemo(() => {
    if (!serverCart) return [];
    if (Array.isArray(serverCart)) return serverCart;
    if (Array.isArray((serverCart as any)?.data?.items))
      return (serverCart as any).data.items;
    if (Array.isArray((serverCart as any)?.items))
      return (serverCart as any).items;
    if (Array.isArray((serverCart as any)?.data))
      return (serverCart as any).data;
    return [];
  }, [serverCart]);

  const effectiveItems: any[] =
    isLoggedIn && serverItems?.length > 0 ? serverItems : guestItems;

  return {
    items: effectiveItems,
    isLoading: isLoggedIn ? isServerLoading : false,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    syncGuestCartToServer,
    totalCount: effectiveItems.reduce(
      (acc: number, i: any) => acc + (Number(i?.quantity) || 0),
      0,
    ),
  };
}

export function useAddToCart() {
  const { addItem } = useCart();

  return useMutation({
    mutationFn: async (item: CartItem) => {
      await addItem(item);
    },
  });
}
