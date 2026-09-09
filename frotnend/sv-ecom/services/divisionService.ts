import { api } from "@/lib/api";

export interface DivisionPayload {
  name: string;
  deliveryCharge: number;
}

export interface Division {
  id: string;
  name: string;
  deliveryCharge: number;
  createdAt: string;
  updatedAt: string;
}

export const divisionService = {
  async getDivisions(): Promise<Division[]> {
    const { data } = await api.get<Division[]>("/order/divisions");
    return data;
  },

  async getDivisionById(id: string): Promise<Division> {
    const { data } = await api.get<Division>(`/order/division/${id}`);
    return data;
  },

  async createDivision(payload: DivisionPayload): Promise<Division> {
    const { data } = await api.post<Division>("/order/division", payload);
    return data;
  },

  async updateDivision(
    id: string,
    payload: Partial<DivisionPayload>,
  ): Promise<Division> {
    const { data } = await api.put<Division>(`/order/division/${id}`, payload);
    return data;
  },

  async deleteDivision(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
      `/order/division/${id}`,
    );
    return data;
  },
};
