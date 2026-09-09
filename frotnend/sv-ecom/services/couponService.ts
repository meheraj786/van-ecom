import { api } from "@/lib/api";

export interface ValidateCouponPayload {
  userId: string;
  code: string;
  items?: {
    productId: string;
    variantId: string;
    quantity: number;
    price?: number;
  }[];
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
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    isValid: boolean;
  };
}

export const couponService = {
  async validateCoupon(
    payload: ValidateCouponPayload,
  ): Promise<ValidateCouponResponse> {
    const { data } = await api.post<ValidateCouponResponse>(
      `/order/coupon/validate?userId=${encodeURIComponent(payload.userId)}`,
      {
        code: payload.code,
        items: payload.items,
      },
    );

    return data;
  },
};
