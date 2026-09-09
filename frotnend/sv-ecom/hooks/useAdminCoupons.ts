import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type CreateCouponPayload,
  adminCouponService,
} from "@/services/adminCouponService";

export function useAdminCoupons(page: number, limit: number) {
  return useQuery({
    queryKey: ["admin-coupons", page, limit],
    queryFn: () => adminCouponService.getCoupons(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useCouponById(id: string) {
  return useQuery({
    queryKey: ["admin-coupon", id],
    queryFn: () => adminCouponService.getCouponById(id),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) =>
      adminCouponService.createCoupon(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCouponPayload>;
    }) => adminCouponService.updateCoupon(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-coupon", variables.id],
      });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCouponService.deleteCoupon(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });
    },
  });
}
