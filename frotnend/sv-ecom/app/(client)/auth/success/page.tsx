"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCart } from "@/hooks/useCart";

function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginUser = useAuthStore((state) => state.loginUser);
  const { syncGuestCartToServer } = useCart();

  useEffect(() => {
    const userParam = searchParams.get("user");

    if (userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        loginUser(parsedUser);
        syncGuestCartToServer();
        router.replace("/dashboard");
        return;
      } catch {}
    }

    router.replace("/dashboard");
  }, [searchParams, loginUser, syncGuestCartToServer, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-gray-400" size={36} />
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-gray-400" size={36} />
        </div>
      }
    >
      <AuthSuccessHandler />
    </Suspense>
  );
}
