import { useQuery } from "@tanstack/react-query";
import { adminOrderService } from "@/services/adminOrderService";

export function useAdminOrders(page: number, limit: number) {
	return useQuery({
		queryKey: ["admin-orders", page, limit],
		queryFn: () => adminOrderService.getAdminOrders(page, limit),
		placeholderData: (previousData) => previousData,
	});
}

export function useAdminOrderDetail(id: string) {
	return useQuery({
		queryKey: ["admin-order-detail", id],
		queryFn: () => adminOrderService.getAdminOrderDetail(id),
		enabled: !!id,
	});
}