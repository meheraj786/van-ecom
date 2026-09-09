import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";

export function useAdminReviews(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["admin-reviews", page, limit],
    queryFn: () => reviewService.getAllReviews(page, limit),
  });
}

export function useProductReviews(productId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["product-reviews", productId, page, limit],
    queryFn: () => reviewService.getProductReviews(productId, page, limit),
    enabled: !!productId,
  });
}

export function useMyReviews(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["my-reviews", page, limit],
    queryFn: () => reviewService.getMyReviews(page, limit),
  });
}

export function useCreateProductReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      reviewService.createReview({ productId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-reviews", productId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteProductReview(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["product-reviews", productId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
