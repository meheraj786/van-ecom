import { api } from "@/lib/api";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  growthRate: number;
  salesChartData: { date: string; sales: number; customers: number }[];
}

export interface DashboardStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: DashboardStats;
}

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    const { data } = await api.get<DashboardStatsResponse>(
      "/admin/dashboard-stats",
    );
    return data;
  },
};
