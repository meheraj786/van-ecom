import { api } from "@/lib/api";

export interface ReviewItem {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    baseImage?: string;
  };
}

export interface ReviewResponse {
  meta: {
    totalReviews: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  reviews: ReviewItem[];
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export const reviewService = {
  async getAllReviews(page = 1, limit = 10): Promise<ReviewResponse> {
    const { data } = await api.get<ReviewResponse>("/review", {
      params: { page, limit },
    });
    return data;
  },

  async getProductReviews(
    productId: string,
    page = 1,
    limit = 10,
  ): Promise<ReviewResponse> {
    const { data } = await api.get<ReviewResponse>(
      `/review/product/${productId}`,
      {
        params: { page, limit },
      },
    );
    return data;
  },

  async getMyReviews(page = 1, limit = 10): Promise<ReviewResponse> {
    const { data } = await api.get<ReviewResponse>("/review/my-reviews", {
      params: { page, limit },
    });
    return data;
  },

  async createReview(payload: CreateReviewPayload): Promise<ReviewItem> {
    const { data } = await api.post<ReviewItem>("/review", payload);
    return data;
  },

  async updateReview(
    id: string,
    payload: UpdateReviewPayload,
  ): Promise<ReviewItem> {
    const { data } = await api.put<ReviewItem>(`/review/${id}`, payload);
    return data;
  },

  async deleteReview(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/review/${id}`);
    return data;
  },
};
