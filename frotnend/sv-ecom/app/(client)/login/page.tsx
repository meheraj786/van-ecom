"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import type * as z from "zod";
import { useLoginUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations/auth";
import { useThemeStore } from "@/store/useThemeStore";
import { User } from "@/types";

const LoginPage = () => {
  const { primaryColor } = useThemeStore();
  const [error, setError] = useState("");
  const router = useRouter();
  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const loginMutation = useLoginUser();
  const { isAuthenticated, loginUser, initialize } = useAuthStore();
  const { syncGuestCartToServer } = useCart();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError("");
    try {
      const res = await loginMutation.mutateAsync(data);
      const userData = res?.user || res?.data?.user;

      if (userData) {
        loginUser(userData);
      }

      await syncGuestCartToServer();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.error ||
            (
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.message
          : undefined;
      setError(message || "Invalid credentials provided");
    }
  };

  const handleGoogleLogin = () => {
    const gatewayUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost";
    window.location.href = `${gatewayUrl}/auth/google`;
  };

  return (
    <div
      style={dynamicStyles}
      className="min-h-screen flex flex-col lg:flex-row bg-white"
    >
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#f8f9fb]">
        <Image
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200"
          alt="Premium Collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
        <div className="absolute bottom-20 left-20 z-10 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-serif leading-tight"
          >
            Elevate Your <br /> Everyday.
          </motion.h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12">
        <div className="max-w-md w-full mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-black tracking-tighter text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-3 text-gray-500 font-medium leading-relaxed">
              Experience the future of premium artifacts. Log in to your
              account.
            </p>
          </header>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-500 uppercase tracking-wider">
              {error}
            </div>
          )}

          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Email Address
                    </FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="alex@lumina.com"
                      aria-invalid={fieldState.invalid}
                      className="h-12 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-slate-800 font-semibold"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[10px]"
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex justify-between items-center mb-1.5">
                      <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Password
                      </FieldLabel>
                      <Link
                        href="#"
                        className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      className="h-12 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-slate-800 font-semibold"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[10px]"
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-14 rounded-xl text-base font-bold shadow-lg mt-8 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
            >
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-12 relative flex items-center justify-center">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </span>
            <span className="relative bg-white px-4 text-[10px] uppercase font-black tracking-widest text-gray-400">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-8 w-full h-14 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-bold text-gray-700 cursor-pointer"
          >
            <FcGoogle size={24} />
            <span>Sign in with Google</span>
          </button>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            New to Lumina?{" "}
            <Link
              href="/signup"
              className="text-[var(--primary)] font-bold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
