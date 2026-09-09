"use client";

import Script from "next/script";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useRegisterUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useCart } from "@/hooks/useCart";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type SignupFormValues, signupSchema } from "@/lib/validations/auth";
import { useThemeStore } from "@/store/useThemeStore";

const SignupPage = () => {
  const { primaryColor } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;
  const googleWindow =
    typeof window !== "undefined"
      ? (window as typeof window & { google?: any })
      : undefined;

  const signupMutation = useRegisterUser();
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

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      newsletter: false,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setError("");
    try {
      await signupMutation.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      router.push("/login");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(message || "Registration failed. Try again.");
    }
  };

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) return;

    setIsGoogleLoading(true);
    setError("");

    try {
      const { data } = await api.post<{ user: any }>("/auth/google/verify", {
        credential: response.credential,
      });

      if (data?.user) {
        loginUser(data.user);
        syncGuestCartToServer();
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Google Sign-Up failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    if (googleWindow?.google) {
      googleWindow.google.accounts.id.initialize({
        client_id:
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
          "336585141019-3q2nh46c6lsqdchv69mcf5u7u5o17o2h.apps.googleusercontent.com",
        callback: handleGoogleCallback,
      });
      googleWindow.google.accounts.id.prompt();
    }
  };

  return (
    <div
      style={dynamicStyles}
      className="min-h-screen flex pt-5 flex-col lg:flex-row bg-white"
    >
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => {
          if (googleWindow?.google) {
            googleWindow.google.accounts.id.initialize({
              client_id:
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
                "336585141019-3q2nh46c6lsqdchv69mcf5u7u5o17o2h.apps.googleusercontent.com",
              callback: handleGoogleCallback,
            });
          }
        }}
      />

      <div className="hidden lg:flex lg:w-1/2 relative bg-[#f2f2f2] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200"
          alt="e-com Lifestyle"
          fill
          className="object-cover opacity-90 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-20 left-16 right-16 z-10 text-white"
        >
          <h1 className="text-7xl font-serif leading-tight tracking-tight">
            Elevate your <br /> commerce <br /> experience.
          </h1>
          <p className="mt-8 text-xl text-white/80 max-w-md font-medium leading-relaxed">
            Join a community of sophisticated curators and global brands defined
            by precision and style.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 py-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <header className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black tracking-tighter text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-gray-500 font-medium leading-relaxed">
              Step into the future of premium retail with e-com.
            </p>
          </header>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-500 uppercase tracking-wider">
              {error}
            </div>
          )}

          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-5">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-700">
                      Full Name
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      className="h-12 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-slate-800 font-semibold"
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
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-700">
                      Email Address
                    </FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@company.com"
                      className="h-12 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-slate-800 font-semibold"
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
                    <FieldLabel className="text-sm font-semibold text-gray-700">
                      Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-12 rounded-xl pr-12 focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-slate-800 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
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
                name="newsletter"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox
                      id="newsletter"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1 border-gray-300 data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]"
                    />
                    <label
                      htmlFor="newsletter"
                      className="text-sm text-gray-500 leading-snug cursor-pointer font-semibold"
                    >
                      Sign up for our weekly newsletter for exclusive
                      collections and sustainability reports.
                    </label>
                  </div>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={signupMutation.isPending || isGoogleLoading}
              className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-blue-100 mt-8 text-white bg-[var(--primary)] hover:bg-[var(--primary)]/90 cursor-pointer"
            >
              {signupMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </span>
            <span className="relative bg-white px-4 text-[10px] uppercase font-black tracking-widest text-gray-400">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleButtonClick}
            disabled={isGoogleLoading}
            className="mt-8 w-full h-14 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-bold text-gray-700 cursor-pointer disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <FcGoogle size={24} />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--primary)] font-bold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
