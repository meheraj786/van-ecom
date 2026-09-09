import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type DivisionPayload,
  divisionService,
} from "@/services/divisionService";

export function useDivisions() {
  return useQuery({
    queryKey: ["divisions"],
    queryFn: () => divisionService.getDivisions(),
  });
}

export function useCreateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DivisionPayload) =>
      divisionService.createDivision(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
}

export function useUpdateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<DivisionPayload>;
    }) => divisionService.updateDivision(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => divisionService.deleteDivision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
}
