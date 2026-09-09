import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  options?: Record<string, string>;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = Array.isArray(get().items) ? get().items : [];
        const exists = items.some((i) => i.id === item.id);
        if (!exists) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (id) => {
        const items = Array.isArray(get().items) ? get().items : [];
        set({ items: items.filter((i) => i.id !== id) });
      },

      toggleItem: (item) => {
        const items = Array.isArray(get().items) ? get().items : [];
        const exists = items.some((i) => i.id === item.id);
        if (exists) {
          get().removeItem(item.id);
        } else {
          get().addItem(item);
        }
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (id) => {
        const items = Array.isArray(get().items) ? get().items : [];
        return items.some((item) => item.id === id);
      },
    }),
    {
      name: "lumina_wishlist_storage",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<WishlistState>;
        return {
          ...current,
          ...persistedState,
          items: Array.isArray(persistedState.items)
            ? (persistedState.items as WishlistItem[])
            : [],
        };
      },
    },
  ),
);
