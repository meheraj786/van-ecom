import { api } from "@/lib/api";

export interface CategoryPayload {
  name: string;
  slug: string;
  image?: string | null;
}

export interface SubCategoryPayload {
  name: string;
  slug: string;
  categoryId: string;
  image?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  subCategories?: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  }[];
}

export interface PaginatedCategoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: {
      totalCategories: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    categories: Category[];
    items?: Category[];
  };
}

export interface PaginatedSubCategoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: {
      totalSubCategories: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    subcategories: {
      id: string;
      name: string;
      slug: string;
      image?: string | null;
      categoryId: string;
      createdAt: string;
      updatedAt: string;
    }[];
    items?: any[];
  };
}

export const categoryService = {
  async getCategories(
    page: number,
    limit: number,
  ): Promise<PaginatedCategoriesResponse> {
    const { data } = await api.get<PaginatedCategoriesResponse>(
      `/product/categories?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async createCategory(payload: CategoryPayload): Promise<void> {
    await api.post("/product/category", payload);
  },

  async updateCategory(id: string, payload: CategoryPayload): Promise<void> {
    await api.put(`/product/category/${id}`, payload);
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/product/category/${id}`);
  },

  async getSubCategories(
    page: number,
    limit: number,
  ): Promise<PaginatedSubCategoriesResponse> {
    const { data } = await api.get<PaginatedSubCategoriesResponse>(
      `/product/subcategories?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async createSubCategory(payload: SubCategoryPayload): Promise<void> {
    await api.post("/product/subcategory", payload);
  },

  async updateSubCategory(
    id: string,
    payload: SubCategoryPayload,
  ): Promise<void> {
    await api.put(`/product/subcategory/${id}`, payload);
  },

  async deleteSubCategory(id: string): Promise<void> {
    await api.delete(`/product/subcategory/${id}`);
  },
};
