import { api } from "@/lib/api";

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export type CouponScope = "ALL" | "PRODUCTS" | "CATEGORIES";

export interface CreateCouponPayload {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startsAt?: string;
  expiresAt: string;
  usageLimit?: number;
  perUserLimit?: number;
  scope?: CouponScope;
  productIds?: string[];
  categoryIds?: string[];
  isActive?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  startsAt: string | null;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  scope: CouponScope;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: {
    id: string;
    productId: string;
  }[];
  categories?: {
    id: string;
    categoryId: string;
  }[];
}

export interface PaginatedCouponsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: {
      totalCoupons: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    coupons: Coupon[];
  };
}

export interface ValidateCouponResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    code: string;
    subtotal: number;
    eligibleSubtotal: number;
    discountAmount: number;
    totalAmount: number;
    discountType: CouponDiscountType;
    discountValue: number;
    isValid: boolean;
  };
}

export const adminCouponService = {
  async getCoupons(
    page: number,
    limit: number,
  ): Promise<PaginatedCouponsResponse> {
    const { data } = await api.get<PaginatedCouponsResponse>(
      `/order/coupon?page=${page}&limit=${limit}`,
    );

    return data;
  },

  async getCouponById(id: string): Promise<Coupon> {
    const { data } = await api.get<{ data: Coupon }>(`/order/coupon/${id}`);

    return data.data;
  },

  async createCoupon(payload: CreateCouponPayload): Promise<void> {
    await api.post("/order/coupon", payload);
  },

  async updateCoupon(
    id: string,
    payload: Partial<CreateCouponPayload>,
  ): Promise<void> {
    await api.put(`/order/coupon/${id}`, payload);
  },

  async deleteCoupon(id: string): Promise<void> {
    await api.delete(`/order/coupon/${id}`);
  },
};
