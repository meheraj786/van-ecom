import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CrmCustomerPayload, crmService } from "@/services/crmService";

export function useCrmCustomers(page: number, limit: number) {
  return useQuery({
    queryKey: ["crm-customers", page, limit],
    queryFn: () => crmService.getCustomers(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCrmCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CrmCustomerPayload) =>
      crmService.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-customers"] });
    },
  });
}

export function useUpdateCrmCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CrmCustomerPayload>;
    }) => crmService.updateCustomer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-customers"] });
    },
  });
}

export function useDeleteCrmCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-customers"] });
    },
  });
}
