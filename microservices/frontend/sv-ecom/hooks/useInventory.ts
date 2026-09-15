import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AddBatchPayload,
  type UpdateBatchPayload,
  inventoryService,
} from "@/services/inventoryService";

export function useAddBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddBatchPayload) =>
      inventoryService.addBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBatchPayload;
    }) => inventoryService.updateBatch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useStocks(params: {
  page?: number;
  limit?: number;
  variantId?: string;
}) {
  return useQuery({
    queryKey: ["stocks", params],
    queryFn: () => inventoryService.getStocks(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useVariantStockSummary(variantId?: string) {
  return useQuery({
    queryKey: ["inventory-summary", variantId],
    queryFn: () =>
      variantId ? inventoryService.getVariantStockSummary(variantId) : null,
    enabled: !!variantId,
  });
}
