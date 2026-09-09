import { api } from "@/lib/api";
import { type Order } from "@/services/orderService";

export interface AdminOrder {
  id: string;
  date: string;
  customer: string;
  total: number;
  payment: "Paid" | "Pending" | "Refunded";
  fulfillment: "Shipped" | "Unfulfilled" | "Processing" | "Delivered";
}

export interface PaginatedAdminOrdersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: {
      totalOrders: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    orders: AdminOrder[];
  };
}

export interface AdminOrderDetailResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    order: Order & {
      createdAt: string;
      customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
      };
    };
  };
}

export const adminOrderService = {
  async getAdminOrders(
    page: number,
    limit: number,
  ): Promise<PaginatedAdminOrdersResponse> {
    const { data } = await api.get<PaginatedAdminOrdersResponse>(
      `/admin/orders?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async getAdminOrderDetail(id: string): Promise<AdminOrderDetailResponse> {
    const { data } = await api.get<AdminOrderDetailResponse>(
      `/admin/orders/${id}`,
    );
    return data;
  },
};
