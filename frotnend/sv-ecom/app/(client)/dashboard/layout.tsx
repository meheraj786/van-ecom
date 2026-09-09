"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import UserProtectedRoute from "@/components/userProtectedRoutes";
import { cn } from "@/lib/utils";
import { User } from "@/types";

const NAV_LINKS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Order History", icon: ShoppingBag, href: "/dashboard/orders" },
  { label: "Account Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { primaryColor } = useThemeStore();
  const { user, logoutUser, initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "UR";

  return (
    <UserProtectedRoute>
      <div
        style={{ "--primary": primaryColor } as React.CSSProperties}
        className="flex min-h-screen pt-20 bg-white"
      >
        <aside className="w-72 border-r border-gray-100 hidden md:flex flex-col fixed inset-y-0 top-20 bg-[#fcfcfc] z-20">
          <div className="p-8 flex flex-col items-center text-center border-b border-gray-50">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg mb-3">
              <AvatarImage src={(user as User)?.avatar || ""} />
              <AvatarFallback className="font-black text-gray-700 text-lg bg-gray-100">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-gray-900 text-base line-clamp-1">
              {user?.name || "Customer"}
            </h2>
            <p className="text-xs text-gray-400 font-medium truncate max-w-[200px] mt-0.5">
              {user?.email}
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/70",
                  )}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-gray-100 mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-gray-400 hover:text-red-600 uppercase tracking-wider transition-colors w-full rounded-xl hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 md:ml-72 bg-[#fcfcfc]">{children}</main>
      </div>
    </UserProtectedRoute>
  );
}
