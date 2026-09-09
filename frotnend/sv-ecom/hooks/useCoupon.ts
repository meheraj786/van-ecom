import { useMutation } from "@tanstack/react-query";
import {
  couponService,
  type ValidateCouponPayload,
} from "@/services/couponService";

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponPayload) =>
      couponService.validateCoupon(payload),
  });
}
