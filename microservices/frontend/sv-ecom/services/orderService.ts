import { api } from "@/lib/api";

export interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode?: string;
  country?: string;
}

export interface CreateOrderPayload {
  divisionId: string;
  customerId?: string;
  couponCode?: string;
  paymentMethod?: "COD" | "SSLCOMMERZ";
  billing: BillingInfo;
  items?: {
    productId: string;
    variantId: string;
    quantity: number;
    price?: number;
    name?: string;
    image?: string;
    sku?: string;
    slug?: string;
    options?: Record<string, string>;
  }[];
}

export interface CreateOrderResponse {
  order: Order;
  gatewayUrl: string | null;
}

export interface Division {
  id: string;
  name: string;
  deliveryCharge: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  variantSnapshot: {
    productName: string;
    productSlug?: string;
    sku?: string;
    image?: string;
    options?: Record<string, string>;
  };
}

export interface Order {
  id: string;
  userId?: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  zipCode?: string | null;
  totalAmount: number;
  discountAmount: number;
  couponCode?: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string | null;
  divisionId: string;
  division?: Division;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  meta: {
    totalOrders: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  orders: Order[];
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const { data } = await api.post<CreateOrderResponse>("/order", payload);
    return data;
  },

  async getOrders(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const { data } = await api.get<OrdersResponse>(
      `/order?${queryParams.toString()}`,
    );
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(
      `/order/single/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const { data } = await api.put<Order>(`/order/${id}/status`, { status });
    return data;
  },

  async getDivisions(): Promise<Division[]> {
    const { data } = await api.get<Division[]>("/order/divisions");
    return data;
  },
};
