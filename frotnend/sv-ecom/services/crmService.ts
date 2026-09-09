import { api } from "@/lib/api";

export interface CrmCustomerPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CrmCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCrmCustomersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: {
      totalCustomers: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    customers: CrmCustomer[];
  };
}

export const crmService = {
  async getCustomers(
    page: number,
    limit: number,
  ): Promise<PaginatedCrmCustomersResponse> {
    const { data } = await api.get<PaginatedCrmCustomersResponse>(
      `/customer?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async createCustomer(payload: CrmCustomerPayload): Promise<void> {
    await api.post("/customer", payload);
  },

  async updateCustomer(
    id: string,
    payload: Partial<CrmCustomerPayload>,
  ): Promise<void> {
    await api.put(`/customer/${id}`, payload);
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customer/${id}`);
  },
};
