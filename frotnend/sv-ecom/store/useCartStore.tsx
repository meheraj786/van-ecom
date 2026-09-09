import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image?: string;
  sku?: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
}

interface CartStoreState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const currentItems = [
          ...(Array.isArray(get().items) ? get().items : []),
        ];
        const existingIndex = currentItems.findIndex(
          (i) => i.variantId === item.variantId,
        );

        if (existingIndex > -1) {
          currentItems[existingIndex].quantity += item.quantity;
        } else {
          currentItems.push(item);
        }

        set({ items: currentItems });
      },

      removeItem: (variantId) => {
        const items = Array.isArray(get().items) ? get().items : [];
        set({
          items: items.filter((item) => item.variantId !== variantId),
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        const items = Array.isArray(get().items) ? get().items : [];
        const currentItems = items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item,
        );

        set({ items: currentItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalCount: () => {
        const items = Array.isArray(get().items) ? get().items : [];
        return items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        const items = Array.isArray(get().items) ? get().items : [];
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: "guest_cart_storage",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<CartStoreState>;
        return {
          ...current,
          ...persistedState,
          items: Array.isArray(persistedState.items)
            ? (persistedState.items as CartItem[])
            : [],
        };
      },
    },
  ),
);
