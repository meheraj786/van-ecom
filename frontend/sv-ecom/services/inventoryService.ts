import { api } from "@/lib/api";

export interface AddBatchPayload {
  variantId: string;
  batchNumber?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantityReceived: number;
  isDiscounted?: boolean;
  beforeDiscount?: number;
  note?: string;
}

export interface UpdateBatchPayload {
  purchasePrice?: number;
  sellingPrice?: number;
  quantityRemaining?: number;
  isDiscounted?: boolean;
  beforeDiscount?: number;
  note?: string;
}

export interface StockBatch {
  id: string;
  variantId: string;
  purchasePrice: number;
  sellingPrice: number;
  quantityReceived: number;
  quantityRemaining: number;
  isDiscounted: boolean;
  beforeDiscount?: number | null;
  batchNumber?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VariantStockSummary {
  variantId: string;
  totalStock: number;
  currentSellingPrice: number;
  currentPurchasePrice: number;
  activeBatchesCount: number;
}

export interface PaginatedStocksResponse {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: {
    meta: {
      totalStocks: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    stocks: StockBatch[];
  };
  meta?: {
    totalStocks: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stocks?: StockBatch[];
}

export const inventoryService = {
  async addBatch(payload: AddBatchPayload): Promise<StockBatch> {
    const { data } = await api.post<StockBatch>("/inventory/batch", payload);
    return data;
  },

  async updateBatch(
    id: string,
    payload: UpdateBatchPayload,
  ): Promise<StockBatch> {
    const { data } = await api.put<StockBatch>(
      `/inventory/batch/${id}`,
      payload,
    );
    return data;
  },

  async getStocks(params: {
    page?: number;
    limit?: number;
    variantId?: string;
  }): Promise<PaginatedStocksResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.variantId) queryParams.append("variantId", params.variantId);

    const { data } = await api.get<PaginatedStocksResponse>(
      `/inventory/stocks?${queryParams.toString()}`,
    );
    return data;
  },

  async getVariantStockSummary(
    variantId: string,
  ): Promise<VariantStockSummary> {
    const { data } = await api.get<VariantStockSummary>(
      `/inventory/summary/${variantId}`,
    );
    return data;
  },

  async deleteBatch(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
      `/inventory/batch/${id}`,
    );
    return data;
  },
};
