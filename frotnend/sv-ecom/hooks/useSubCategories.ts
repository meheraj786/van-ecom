import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type SubCategoryPayload,
  categoryService,
} from "@/services/categoryService";

export function useSubCategories(page: number, limit: number) {
  return useQuery({
    queryKey: ["subcategories", page, limit],
    queryFn: () => categoryService.getSubCategories(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubCategoryPayload) =>
      categoryService.createSubCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SubCategoryPayload;
    }) => categoryService.updateSubCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
}
