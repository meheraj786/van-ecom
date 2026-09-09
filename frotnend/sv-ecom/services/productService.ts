import { api } from "@/lib/api";

export interface ProductOptionValueInput {
  value: string;
  metadata?: Record<string, any>;
}

export interface ProductOptionInput {
  name: string;
  values: ProductOptionValueInput[];
}

export interface CreateVariantInput {
  sku: string;
  images?: string[];
  optionValueIds?: string[];
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  sku?: string;
  baseImage?: string;
  description?: string;
  categoryIds: string[];
  subCategoryIds?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  options?: ProductOptionInput[];
  variants?: CreateVariantInput[];
}

export interface ProductOptionValue {
  id: string;
  productOptionId: string;
  value: string;
  metadata?: Record<string, any> | null;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  productOptionValues: ProductOptionValue[];
}

export interface ProductVariantValue {
  id: string;
  productVariantId: string;
  optionValueId: string;
  optionValue: {
    id: string;
    value: string;
    option: {
      id: string;
      name: string;
    };
  };
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  images: string[];
  combinationKey: string;
  productVariantValues: ProductVariantValue[];
}

export interface ProductCategoryRelation {
  id: string;
  productId: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductSubCategoryRelation {
  id: string;
  productId: string;
  subCategoryId: string;
  subCategory: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  baseImage?: string | null;
  description?: string | null;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  averageRating?: number;
  categories: ProductCategoryRelation[];
  subCategories: ProductSubCategoryRelation[];
  productOptions: ProductOption[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsResponse {
  data: {
    items: Product[];
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productService = {
  async getProducts(params: {
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
  }): Promise<PaginatedProductsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params.subCategoryId)
      queryParams.append("subCategoryId", params.subCategoryId);
    if (params.isNew !== undefined)
      queryParams.append("isNew", params.isNew.toString());
    if (params.isBestSeller !== undefined)
      queryParams.append("isBestSeller", params.isBestSeller.toString());
    if (params.isFeatured !== undefined)
      queryParams.append("isFeatured", params.isFeatured.toString());
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.inStock !== undefined)
      queryParams.append("inStock", params.inStock.toString());
    if (params.color) queryParams.append("color", params.color);
    if (params.size) queryParams.append("size", params.size);
    if (params.option) queryParams.append("option", params.option);
    if (params.optionValue)
      queryParams.append("optionValue", params.optionValue);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);

    const { data } = await api.get<PaginatedProductsResponse>(
      `/product?${queryParams.toString()}`,
    );
    return data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const { data } = await api.get<Product>(`/product/${slug}`);
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/product/id/${id}`);
    return data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const { data } = await api.post<Product>("/product", payload);
    return data;
  },

  async updateProduct(
    id: string,
    payload: Partial<CreateProductPayload>,
  ): Promise<Product> {
    const { data } = await api.put<Product>(`/product/${id}`, payload);
    return data;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/product/${id}`);
    return data;
  },

  async createVariant(
    productId: string,
    payload: CreateVariantInput,
  ): Promise<ProductVariant> {
    const { data } = await api.post<ProductVariant>(
      `/product/${productId}/variant`,
      payload,
    );
    return data;
  },

  async updateVariant(
    variantId: string,
    payload: Partial<CreateVariantInput>,
  ): Promise<ProductVariant> {
    const { data } = await api.put<ProductVariant>(
      `/product/variant/${variantId}`,
      payload,
    );
    return data;
  },

  async deleteVariant(variantId: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
      `/product/variant/${variantId}`,
    );
    return data;
  },

  async getCategories(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const { data } = await api.get(
      `/product/categories?${queryParams.toString()}`,
    );
    return data;
  },

  async getSubCategories(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const { data } = await api.get(
      `/product/subcategories?${queryParams.toString()}`,
    );
    return data;
  },
};
