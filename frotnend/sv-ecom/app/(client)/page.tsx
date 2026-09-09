"use client";

import * as React from "react";
import { useTheme } from "@/hooks/useTheme";
import { Hero } from "@/components/clientComponents/home/Hero";
import CategoryGrid from "@/components/clientComponents/home/CategoryGrid";
import { ProductShowcase } from "@/components/clientComponents/home/TrendingNow";
import { PromoBanner1 } from "@/components/clientComponents/home/PromoBanner";
import Testimonials from "@/components/clientComponents/home/Testimonials";

export default function HomePage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const { data: theme, isLoading } = useTheme();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || (isLoading && !theme)) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-neutral-100 border-t-neutral-900 animate-spin" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400 font-mono animate-pulse">
          Loading Storefront...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Hero />
      <CategoryGrid />
      <ProductShowcase />
      <PromoBanner1 />
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 space-y-16">
        <Testimonials />
      </div>
    </div>
  );
}
