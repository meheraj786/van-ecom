import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";

export function useCreateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: any }) =>
      productService.createVariant(productId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      if (vars && typeof vars === "object") {
        qc.invalidateQueries({ queryKey: ["product", vars.productId] });
      }
    },
  });
}

export function useUpdateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: any }) =>
      productService.updateVariant(variantId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => productService.deleteVariant(variantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
