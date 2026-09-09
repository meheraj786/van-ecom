"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCart } from "@/hooks/useCart";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useAuthStore();
  const { syncGuestCartToServer } = useCart();

  React.useEffect(() => {
    const rawUser = searchParams.get("user");

    if (rawUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(rawUser));
        loginUser(userData);
        syncGuestCartToServer();
        router.push("/dashboard");
      } catch (err) {
        console.error("Failed to parse OAuth user:", err);
        router.push("/login?error=OAuthParsingFailed");
      }
    } else {
      router.push("/dashboard");
    }
  }, [searchParams, router, loginUser, syncGuestCartToServer]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="animate-spin text-gray-900" size={40} />
      <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
        Authenticating session...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
          <Loader2 className="animate-spin text-gray-900" size={40} />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Authenticating session...
          </p>
        </div>
      }
    >
      <AuthCallbackContent />
    </React.Suspense>
  );
}
