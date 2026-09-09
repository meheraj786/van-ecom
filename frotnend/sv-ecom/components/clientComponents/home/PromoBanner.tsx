"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Flame, Sparkles, Tag } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PromoBanner1() {
  const { data: theme } = useTheme();
  const sale = theme?.sale;

  const [copied, setCopied] = React.useState(false);

  if (!sale || !sale.name) return null;

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!sale.coupon) return;
    navigator.clipboard.writeText(sale.coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const bannerBg = sale.bgColor || "#111827";

  return (
    <section className="my-16 md:my-24 max-w-[1440px] mx-auto px-6 md:px-12">
      <div
        className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-12 md:p-16 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12 shadow-2xl transition-all duration-500"
        style={{ backgroundColor: bannerBg }}
      >
        {/* Ambient Decorative Backdrops */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-white/15 hover:bg-white/20 backdrop-blur-md text-white font-bold text-[11px] uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/10 shadow-xs">
            <Flame size={13} className="mr-1.5 text-amber-400 fill-amber-400" />
            {sale.name}
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
            {sale.title}
          </h2>

          <p className="text-sm md:text-base text-white/80 leading-relaxed font-normal max-w-xl">
            {sale.para}
          </p>

          {sale.coupon && (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyCoupon}
                className={cn(
                  "group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all cursor-pointer",
                  copied
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/40",
                )}
                title="Click to copy coupon code"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Tag
                    size={14}
                    className="text-amber-400 group-hover:rotate-12 transition-transform"
                  />
                )}
                <span>CODE: {sale.coupon}</span>
                <span className="text-[10px] uppercase font-sans font-medium opacity-60 ml-1">
                  {copied ? "(Copied!)" : "(Click to copy)"}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <Link href={sale.link || "/shop"} className="block w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-14 px-9 rounded-2xl bg-white text-gray-900 hover:bg-neutral-100 font-bold uppercase tracking-wider text-xs shadow-2xl shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2">
              <span>Shop The Sale</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PromoBanner1;
