import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsService.getDashboardStats,
    refetchInterval: 5 * 60 * 1000,
  });
}
