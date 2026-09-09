import { api } from "@/lib/api";

export interface AddToCartPayload {
  productId: string;
  variantId: string;
  name?: string;
  image?: string;
  sku?: string;
  options?: Record<string, string>;
  quantity: number;
  price?: number;
}

export interface UpdateQuantityPayload {
  variantId: string;
  quantity: number;
}

export interface BackendCartItem {
  productId: string;
  variantId: string;
  quantity: number;
  price?: number;
}

export interface CartResponse {
  items: BackendCartItem[];
}

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const { data } = await api.get<CartResponse>("/cart");
    return data;
  },

  async addToCart(payload: AddToCartPayload): Promise<CartResponse> {
    const { data } = await api.post<CartResponse>("/cart/add", payload);
    return data;
  },

  async updateQuantity(payload: UpdateQuantityPayload): Promise<CartResponse> {
    const { data } = await api.put<CartResponse>(
      "/cart/update-quantity",
      payload,
    );
    return data;
  },

  async removeFromCart(variantId: string): Promise<CartResponse> {
    const { data } = await api.delete<CartResponse>(
      `/cart/${encodeURIComponent(variantId)}`,
    );
    return data;
  },

  async clearCart(): Promise<void> {
    await api.delete("/cart");
  },
};
