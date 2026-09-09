import { api } from "@/lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name?: string;
}

export interface Vendor {
  id: string;
  vendorId?: string;
  userId?: string;
  email: string;
  name: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  vendorId?: string;
  userId?: string;
  name: string;
  role?: string;
}

export interface LoginResponse {
  message: string;
  vendor: Vendor;
  data?: {
    vendor: Vendor;
  };
}

export interface UserLoginResponse {
  message: string;
  user: User;
  data?: {
    user: User;
  };
}

export const authService = {
  async loginVendor(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(
      "/auth/vendor/login",
      payload,
    );
    return data;
  },

  async registerUser(payload: SignupPayload): Promise<void> {
    await api.post("/auth/register", payload);
  },

  async loginUser(payload: LoginPayload): Promise<UserLoginResponse> {
    const { data } = await api.post<UserLoginResponse>("/auth/login", payload);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
