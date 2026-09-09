"use client";

import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { type CSSProperties } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useTheme } from "@/hooks/useTheme";
import { useAdminReviews } from "@/hooks/useReviews";

export default function Testimonials() {
  const { data: reviewsResponse, isLoading } = useAdminReviews();
  const { data: themeData } = useTheme();
  const storePrimaryColor = useThemeStore((state) => state.primaryColor);
  const primaryColor =
    themeData?.primaryColor || storePrimaryColor || "#111827";

  const [displayedTestimonials, setDisplayedTestimonials] = React.useState<
    any[]
  >([]);

  const rawReviews: any[] = React.useMemo(() => {
    if (!reviewsResponse) return [];
    const res = reviewsResponse as any;
    if (Array.isArray(res?.data?.reviews)) {
      return res.data.reviews;
    }
    if (Array.isArray(res?.reviews)) {
      return res.reviews;
    }
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  }, [reviewsResponse]);

  React.useEffect(() => {
    if (rawReviews?.length > 0) {
      let eligible = rawReviews.filter((t: any) => {
        const isFiveStar = Number(t.rating) === 5;
        const text = (t.comment || t.quote || "").trim();
        return isFiveStar && text?.length > 0;
      });

      if (eligible?.length < 3) {
        const fallbackReviews = rawReviews.filter((t: any) => {
          const isGood = Number(t.rating) >= 4;
          const text = (t.comment || t.quote || "").trim();
          return isGood && text?.length > 0;
        });
        eligible = fallbackReviews?.length > 0 ? fallbackReviews : rawReviews;
      }

      const shuffled = [...eligible]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      setDisplayedTestimonials(shuffled);
    }
  }, [rawReviews]);

  const dynamicStyles = {
    "--primary": primaryColor,
  } as CSSProperties;

  if (
    isLoading ||
    !displayedTestimonials ||
    displayedTestimonials?.length === 0
  ) {
    return null;
  }

  return (
    <section style={dynamicStyles} className="py-20 px-6 md:px-16 bg-white">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Community Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            What our customers say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedTestimonials.map((t: any, idx: number) => {
            const reviewText =
              t.comment || t.quote || "Excellent product and service!";
            const authorName = t.userName || t.author || "Verified Customer";
            const productName = t.product?.name;
            const productSlug = t.product?.slug;

            return (
              <div
                key={t.id || t._id || idx}
                className="p-8 sm:p-10 bg-[#f8f9fa] rounded-[32px] border border-gray-100 hover:border-gray-200 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div className="space-y-4">
                  <div
                    className="flex space-x-1"
                    style={{ color: "var(--primary)" }}
                  >
                    {Array.from({ length: Number(t.rating) || 5 }).map(
                      (_, starIdx) => (
                        <Star key={starIdx} size={14} fill="currentColor" />
                      ),
                    )}
                  </div>

                  <p className="text-gray-700 italic leading-relaxed text-sm">
                    &quot;{reviewText}&quot;
                  </p>

                  {productName && (
                    <div className="pt-1">
                      {productSlug ? (
                        <Link
                          href={`/shop/product/${productSlug}`}
                          className="text-[11px] font-semibold text-gray-400 hover:text-gray-900 transition-colors block truncate"
                        >
                          Reviewed on:{" "}
                          <span className="underline">{productName}</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] font-semibold text-gray-400 block truncate">
                          Reviewed on: {productName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3.5 pt-6 mt-6 border-t border-gray-200/50">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: "var(--primary)",
                    }}
                  >
                    {authorName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-gray-900 truncate">
                      {authorName}
                    </h5>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                      Verified Buyer
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
