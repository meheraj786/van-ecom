import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateProductPayload,
  type CreateVariantInput,
  productService,
} from "@/services/productService";

export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  color?: string;
  size?: string;
  option?: string;
  optionValue?: string;
  sortBy?:
    | "newest"
    | "oldest"
    | "name-asc"
    | "name-desc"
    | "rating-high"
    | "rating-low";
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params || {}),
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", "slug", slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ["product", "id", id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories({ page: 1, limit: 100 }),
  });
}

export function useSubCategories() {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: () => productService.getSubCategories({ page: 1, limit: 100 }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      productService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateProductPayload>;
    }) => productService.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVariantInput) =>
      productService.createVariant(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", "id", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => productService.deleteVariant(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", "id", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
