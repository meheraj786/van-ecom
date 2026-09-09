import { useMutation } from "@tanstack/react-query";
import {
  type LoginPayload,
  type SignupPayload,
  authService,
} from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

export function useRegisterUser() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => authService.registerUser(payload),
  });
}

export function useLoginUser() {
  const loginStore = useAuthStore((state) => state.loginUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.loginUser(payload),
    onSuccess: (response: any) => {
      const user = response?.user || response?.data?.user;
      if (user) {
        loginStore(user);
      }
    },
  });
}

export function useLoginVendor() {
  const loginStore = useAuthStore((state) => state.loginVendor);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.loginVendor(payload),
    onSuccess: (response: any) => {
      const vendor = response?.vendor || response?.data?.vendor;
      if (vendor) {
        loginStore(vendor);
      }
    },
  });
}
