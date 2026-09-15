"use client";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import React from "react";

const TopNav = () => {
  const { user } = useAuthStore();

  const greetings = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };
  return (
    <div className=" border-b border-gray-100 bg-gray-50/60">
      <div className="lg:w-3/4 mx-auto px-6 md:px-12 h-9 flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {greetings()}, {user?.name || "Guest"}
        </span>
        <div className="flex items-center gap-5">
          <Link
            href="/track-order"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/contact"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
