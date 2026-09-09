"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAuthenticatedVendor, isLoading, initialize } =
    useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // User Athoba Vendor—konokichu ekta authenticated kina check
  const isAuth = isAuthenticated || isAuthenticatedVendor;

  useEffect(() => {
    setIsMounted(true);
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isMounted && !isLoading && !isAuth) {
      router.push("/admin/login");
    }
  }, [isMounted, isLoading, isAuth, router]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!isAuth) return null;

  return <>{children}</>;
}