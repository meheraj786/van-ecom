"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLoginVendor } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type AdminLoginFormValues,
  adminLoginSchema,
} from "@/lib/validations/admin-auth";
import { useThemeStore } from "@/store/useThemeStore";

const AdminLoginPage = () => {
  const { primaryColor } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const loginMutation = useLoginVendor();
  
  // FIX 1: Use `isAuthenticatedVendor` & `loginVendor`
  const { isAuthenticatedVendor, loginVendor, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // FIX 2: Redirect if vendor is authenticated
  useEffect(() => {
    if (isAuthenticatedVendor) {
      router.push("/admin");
    }
  }, [isAuthenticatedVendor, router]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setError("");
    try {
      await loginMutation.mutateAsync(data);
      router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials provided");
    }
  };

  return (
    <div
      style={dynamicStyles}
      className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fb]"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl px-4 z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-gray-200/50 mb-6 text-[var(--primary)]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">
            Luxe Admin
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-widest">
            Secure Management Portal
          </p>
        </div>

        <Card className="bg-white w-xl p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white/50 backdrop-blur-xl">
          <CardContent>
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-500 uppercase tracking-wider">
                {error}
              </div>
            )}
            <form id="admin-login-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="space-y-6">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Administrator Email
                      </FieldLabel>
                      <div className="relative mt-1.5">
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@luxecommerce.com"
                          className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/10 transition-all pl-4 font-bold text-slate-800"
                        />
                      </div>
                      {fieldState.invalid && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error?.message}
                        </p>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Master Password
                      </FieldLabel>
                      <div className="relative mt-1.5">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/10 transition-all pl-4 text-slate-850"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--primary)] transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {fieldState.invalid && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error?.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-14 rounded-xl text-sm font-black uppercase tracking-widest mt-10 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Authorize Access <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <Link
            href="/"
            className="text-xs font-bold text-gray-400 hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={12} /> Return to Storefront
          </Link>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
            © 2024 LuxeCommerce. All Systems Nominal.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;