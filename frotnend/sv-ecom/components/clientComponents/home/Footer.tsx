"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa";
import {
  type NewsletterFormValues,
  newsletterSchema,
} from "@/lib/validations/newsletter";
import { useTheme } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/useThemeStore";
import Logo from "../Logo";
import { cn } from "@/lib/utils";

function useNewsletterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = (data: NewsletterFormValues) => {
    reset();
  };

  return { register, handleSubmit, errors, onSubmit };
}

function useFooterLinks() {
  const { data: themeData } = useTheme();
  const storePrimaryColor = useThemeStore((state) => state.primaryColor);
  const primaryColor =
    themeData?.primaryColor || storePrimaryColor || "#111827";

  const navigationLinks = React.useMemo(() => {
    const defaultLinks = [
      { label: "Home", href: "/" },
      { label: "Shop All", href: "/shop" },
    ];

    const customMenus: string[] = themeData?.navbar?.menus || [];

    if (!Array.isArray(customMenus) || customMenus?.length === 0) {
      return defaultLinks;
    }

    const dynamicLinks = customMenus.map((menuName: string) => {
      const lower = menuName.trim().toLowerCase();

      if (lower === "new arrivals" || lower === "new") {
        return { label: menuName, href: "/shop?isNew=true&page=1" };
      }
      if (lower === "best sellers" || lower === "best") {
        return { label: menuName, href: "/shop?isBestSeller=true&page=1" };
      }
      if (lower === "featured items" || lower === "featured") {
        return { label: menuName, href: "/shop?isFeatured=true&page=1" };
      }

      return {
        label: menuName,
        href: `/shop?category=${encodeURIComponent(lower)}&page=1`,
      };
    });

    return [...defaultLinks, ...dynamicLinks];
  }, [themeData]);

  const companyLinks = [
    { label: "About Our Story", href: "/about" },
    { label: "Contact Support", href: "/contact" },
    { label: "Customer Dashboard", href: "/dashboard" },
    { label: "My Order History", href: "/dashboard/orders" },
    { label: "My Wishlist", href: "/wishlist" },
  ];

  return {
    themeData,
    primaryColor,
    navigationLinks,
    companyLinks,
    copyright:
      themeData?.footer?.copyright ||
      `© ${new Date().getFullYear()} Lumina. All rights reserved.`,
    contactInfo:
      themeData?.footer?.contactInfo ||
      themeData?.contact?.phone ||
      "support@lumina.com | +880 1700-000000",
  };
}

const SocialIcons = ({
  socialLinks,
  className,
}: {
  socialLinks?: any;
  className?: string;
}) => {
  const items = [
    { key: "facebook", icon: FaFacebookF, url: socialLinks?.facebook },
    { key: "instagram", icon: FaInstagram, url: socialLinks?.instagram },
    { key: "youtube", icon: FaYoutube, url: socialLinks?.youtube },
    { key: "twitter", icon: FaTwitter, url: socialLinks?.twitter },
    { key: "tiktok", icon: FaTiktok, url: socialLinks?.tiktok },
    { key: "linkedin", icon: FaLinkedinIn, url: socialLinks?.linkedin },
  ].filter((item) => Boolean(item.url && item.url.trim()));

  if (items?.length === 0) {
    return (
      <div className={className ?? "flex items-center gap-3"}>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
        >
          <FaInstagram size={14} />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
        >
          <FaFacebookF size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className={className ?? "flex items-center gap-2.5"}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all shadow-2xs hover:scale-105"
          >
            <Icon size={14} />
          </a>
        );
      })}
    </div>
  );
};

export function Footer1() {
  const {
    themeData,
    primaryColor,
    navigationLinks,
    companyLinks,
    copyright,
    contactInfo,
  } = useFooterLinks();
  const { register, handleSubmit, errors, onSubmit } = useNewsletterForm();

  return (
    <footer
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="bg-[#f8f9fb] pt-20 pb-12 px-6 md:px-16 border-t border-gray-100"
    >
      <div className="container mx-auto max-w-4xl flex flex-col items-center text-center">
        {themeData?.logo ? (
          <div className="relative h-9 w-32 mb-4">
            <img
              src={themeData.logo}
              alt="Brand Logo"
              className="h-full w-full object-contain mx-auto"
            />
          </div>
        ) : (
          <Logo />
        )}

        <p className="text-gray-500 mt-2 text-xs md:text-sm leading-relaxed max-w-md font-medium">
          {contactInfo}
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8">
          {[...navigationLinks, ...companyLinks].map((link, idx) => (
            <Link
              key={`${link.label}-${idx}`}
              href={link.href}
              className="text-xs md:text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full max-w-md mt-10"
        >
          <input
            {...register("email")}
            placeholder="Enter email for weekly releases"
            className={cn(
              "w-full bg-white border rounded-full py-3.5 px-6 pr-12 text-xs md:text-sm text-center shadow-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all",
              errors.email ? "border-red-400" : "border-gray-200",
            )}
          />
          <button
            type="submit"
            style={{ backgroundColor: "var(--primary)" }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer"
          >
            <ArrowRight size={15} />
          </button>
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-2">
              {errors.email.message}
            </p>
          )}
        </form>

        <SocialIcons
          socialLinks={themeData?.socialLinks}
          className="flex items-center justify-center gap-3 mt-10"
        />
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200/80 text-center">
        <p className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">
          {copyright}
        </p>
      </div>
    </footer>
  );
}

export function Footer2() {
  const {
    themeData,
    primaryColor,
    navigationLinks,
    companyLinks,
    copyright,
    contactInfo,
  } = useFooterLinks();
  const { register, handleSubmit, errors, onSubmit } = useNewsletterForm();

  return (
    <footer
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="bg-[#f8f9fb] pt-16 pb-12 px-6 md:px-16 border-t border-gray-100"
    >
      <div className="container mx-auto">
        <div className="rounded-3xl bg-white border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xs">
          <div className="max-w-md">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Join our community.
            </h3>
            <p className="text-gray-500 text-xs md:text-sm mt-2">
              Subscribe for private catalogue previews, new arrivals, and
              special promotions.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative w-full md:w-[380px] shrink-0"
          >
            <input
              {...register("email")}
              placeholder="Enter your email"
              className={cn(
                "w-full bg-[#f8f9fb] border rounded-full py-3.5 px-6 pr-12 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all",
                errors.email ? "border-red-400" : "border-gray-200",
              )}
            />
            <button
              type="submit"
              style={{ backgroundColor: "var(--primary)" }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer"
            >
              <ArrowRight size={15} />
            </button>
            {errors.email && (
              <p className="text-[10px] text-red-500 mt-2 ml-4">
                {errors.email.message}
              </p>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-14">
          <div className="md:col-span-2 space-y-4">
            {themeData?.logo ? (
              <div className="relative h-8 w-28">
                <img
                  src={themeData.logo}
                  alt="Brand Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <Logo />
            )}
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
              {contactInfo}
            </p>
            <SocialIcons socialLinks={themeData?.socialLinks} />
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-5">
              Explore &amp; Shop
            </h4>
            <ul className="space-y-2.5">
              {navigationLinks.map((link, idx) => (
                <li key={`${link.label}-${idx}`}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-gray-500 hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-5">
              Company &amp; Care
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link, idx) => (
                <li key={`${link.label}-${idx}`}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-gray-500 hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">
            {copyright}
          </p>
          <span className="text-[11px] text-gray-400 font-mono">
            {contactInfo}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Footer3() {
  const {
    themeData,
    primaryColor,
    navigationLinks,
    companyLinks,
    copyright,
    contactInfo,
  } = useFooterLinks();
  const { register, handleSubmit, errors, onSubmit } = useNewsletterForm();

  return (
    <footer
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="bg-[#f8f9fb] pt-20 pb-12 px-6 md:px-16 border-t border-gray-100"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:col-span-2 space-y-4 shadow-2xs">
            {themeData?.logo ? (
              <div className="relative h-8 w-28">
                <img
                  src={themeData.logo}
                  alt="Brand Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <Logo />
            )}
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
              {contactInfo}
            </p>
            <SocialIcons socialLinks={themeData?.socialLinks} />
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-5">
              Explore &amp; Shop
            </h4>
            <ul className="space-y-2.5">
              {navigationLinks.map((link, idx) => (
                <li key={`${link.label}-${idx}`}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-gray-500 hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-5">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link, idx) => (
                <li key={`${link.label}-${idx}`}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-gray-500 hover:text-[var(--primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-between shadow-2xs">
          <div>
            <h4 className="font-bold text-base text-gray-900 mb-2">
              Newsletter
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Subscribe to receive weekly updates, curated drops, and promotion
              alerts.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <input
              {...register("email")}
              placeholder="Enter your email"
              className={cn(
                "w-full bg-[#f8f9fb] border rounded-full py-3.5 px-6 pr-12 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all",
                errors.email ? "border-red-400" : "border-gray-200",
              )}
            />
            <button
              type="submit"
              style={{ backgroundColor: "var(--primary)" }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2.5 rounded-full hover:opacity-90 transition-all cursor-pointer"
            >
              <ArrowRight size={15} />
            </button>
            {errors.email && (
              <p className="text-[10px] text-red-500 mt-2 ml-4">
                {errors.email.message}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 text-center">
        <p className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">
          {copyright}
        </p>
      </div>
    </footer>
  );
}

export default function Footer() {
  const { data: themeData } = useTheme();
  const layout = themeData?.footer?.layout || 1;

  if (layout === 2) {
    return <Footer2 />;
  }

  if (layout === 3) {
    return <Footer3 />;
  }

  return <Footer1 />;
}
