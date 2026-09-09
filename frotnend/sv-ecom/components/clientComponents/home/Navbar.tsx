"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  ChevronDown,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartCount } from "@/hooks/useCart";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useTheme } from "@/hooks/useTheme";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import Logo from "../Logo";
import TopNav from "./TopNav";
import { cn } from "@/lib/utils";

export interface NavSubItem {
  label: string;
  href: string;
  image?: string;
}

export interface NavHeaderLink {
  label: string;
  href: string;
  subCategories?: NavSubItem[];
  categoryImage?: string;
}

function SearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchResponse, isLoading } = useProducts({
    page: 1,
    limit: 6,
    search: debouncedQuery || undefined,
  });

  const searchRes = searchResponse as any;
  const productData = searchRes?.data?.items || searchRes?.items || [];
  const products = Array.isArray(productData) ? productData : [];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    onClose();
    router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}&page=1`);
  };

  const handleProductClick = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-16 sm:pt-24 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
        >
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search products by title, category, or style..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm sm:text-base font-medium text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
          >
            ESC
          </button>
        </form>

        <div className="p-6 overflow-y-auto space-y-6">
          {!debouncedQuery ? (
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                Popular Quick Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "New Arrivals", href: "/shop?isNew=true&page=1" },
                  {
                    label: "Best Sellers",
                    href: "/shop?isBestSeller=true&page=1",
                  },
                  {
                    label: "Featured Items",
                    href: "/shop?isFeatured=true&page=1",
                  },
                  { label: "All Collections", href: "/shop" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(item.href);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-700 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-gray-400">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <p className="text-xs font-medium">Searching catalogue...</p>
            </div>
          ) : products?.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-bold text-gray-900">
                No products found for &quot;{debouncedQuery}&quot;
              </p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Try searching with different keywords or check out our full
                collection.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Matching Products ({products?.length})
                </span>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  View all in Shop <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product: any) => {
                  const image =
                    product.baseImage ||
                    product.variants?.[0]?.images?.[0] ||
                    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=300";

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/80 transition-all cursor-pointer group"
                    >
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border">
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {product.categories?.[0]?.category?.name || "Product"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function useNavbarState() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: themeData } = useTheme();
  const { data: categoriesResponse } = useCategories(1, 100);
  const storePrimaryColor = useThemeStore((state) => state?.primaryColor);

  const categories = React.useMemo(() => {
    const catRes = categoriesResponse as any;
    const categoryData =
      catRes?.data?.items ||
      catRes?.items ||
      catRes?.data?.categories ||
      (Array.isArray(catRes) ? catRes : []);
    return Array.isArray(categoryData) ? categoryData : [];
  }, [categoriesResponse]);

  const primaryColor =
    themeData?.primaryColor || storePrimaryColor || "#111827";

  const user = useAuthStore((state) => state?.user);
  const isAuthenticated = Boolean(user);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const totalCartCount = useCartCount();
  const wishlistItems = useWishlistStore((state) => state?.items ?? []);
  const wishlistCount = Array.isArray(wishlistItems)
    ? wishlistItems?.length
    : 0;

  React.useEffect(() => {
    setIsMounted(true);
    useAuthStore.getState().initialize();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsOpen(false);
    router.push("/login");
  };

  const dynamicStyles = { "--primary": primaryColor } as React.CSSProperties;

  const headerLinks: NavHeaderLink[] = React.useMemo(() => {
    const defaultLinks: NavHeaderLink[] = [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
    ];

    const customMenus: string[] = themeData?.navbar?.menus || [];

    if (!Array.isArray(customMenus) || customMenus?.length === 0) {
      return defaultLinks;
    }

    const dynamicLinks: NavHeaderLink[] = customMenus.map(
      (menuName: string) => {
        const lower = menuName.trim().toLowerCase();

        if (lower === "new arrivals" || lower === "new") {
          return {
            label: menuName,
            href: "/shop?isNew=true&page=1",
          };
        }

        if (lower === "best sellers" || lower === "best") {
          return {
            label: menuName,
            href: "/shop?isBestSeller=true&page=1",
          };
        }

        if (lower === "featured items" || lower === "featured") {
          return {
            label: menuName,
            href: "/shop?isFeatured=true&page=1",
          };
        }

        const matchedCat = categories.find(
          (c: any) =>
            c.name?.toLowerCase() === lower || c.slug?.toLowerCase() === lower,
        );

        if (matchedCat) {
          const catSlug = matchedCat.slug || matchedCat.id;
          const subCats: any[] = Array.isArray(matchedCat.subCategories)
            ? matchedCat.subCategories
            : [];

          return {
            label: matchedCat.name || menuName,
            href: `/shop?category=${encodeURIComponent(catSlug)}&page=1`,
            categoryImage: matchedCat.image,
            subCategories: subCats.map((sub) => ({
              label: sub.name,
              href: `/shop?category=${encodeURIComponent(
                catSlug,
              )}&subCategory=${encodeURIComponent(sub.slug || sub.id)}&page=1`,
              image: sub.image,
            })),
          };
        }

        return {
          label: menuName,
          href: `/shop?category=${encodeURIComponent(lower)}&page=1`,
        };
      },
    );

    return [...defaultLinks, ...dynamicLinks];
  }, [themeData, categories]);

  const isLinkActive = React.useCallback(
    (linkHref: string) => {
      if (!pathname) return false;

      if (linkHref === "/") {
        return (
          pathname === "/" && (!searchParams || searchParams.toString() === "")
        );
      }

      const [targetPath, targetQuery] = linkHref.split("?");

      if (pathname !== targetPath) return false;

      if (!targetQuery) {
        const hasFilters =
          searchParams?.get("category") ||
          searchParams?.get("subCategory") ||
          searchParams?.get("isNew") ||
          searchParams?.get("isBestSeller") ||
          searchParams?.get("isFeatured") ||
          searchParams?.get("search");

        return !hasFilters;
      }

      const targetParams = new URLSearchParams(targetQuery);
      let matchesAll = true;

      targetParams.forEach((val, key) => {
        if (key === "page") return;
        if (searchParams?.get(key) !== val) {
          matchesAll = false;
        }
      });

      return matchesAll;
    },
    [pathname, searchParams],
  );

  const logoImage = themeData?.logo || "";

  return {
    isOpen,
    setIsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isMounted,
    pathname,
    headerLinks,
    isLinkActive,
    primaryColor,
    user,
    isAuthenticated,
    handleLogout,
    totalCartCount,
    wishlistCount,
    dynamicStyles,
    logoImage,
    themeData,
  };
}

const CategoryPopup = ({
  link,
  isLinkActive,
  onClose,
}: {
  link: NavHeaderLink;
  isLinkActive: (href: string) => boolean;
  onClose?: () => void;
}) => {
  if (!link.subCategories || link.subCategories?.length === 0) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block z-[99999] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
      <div className="w-[320px] sm:w-[380px] rounded-3xl border border-gray-100/80 bg-white/95 backdrop-blur-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              Category
            </span>
            <Link
              href={link.href}
              onClick={onClose}
              className="text-sm font-bold text-gray-900 hover:text-[var(--primary)] transition-colors flex items-center gap-1.5"
            >
              {link.label}
              <span className="text-[10px] font-semibold text-gray-400">
                (View All)
              </span>
            </Link>
          </div>
          {link.categoryImage && (
            <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-gray-50 border">
              <Image
                src={link.categoryImage}
                alt={link.label}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-2">
            Subcategories
          </span>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {link.subCategories.map((sub) => {
              const isSubActive = isLinkActive(sub.href);
              return (
                <Link
                  key={sub.label}
                  href={sub.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-2xl transition-all group/sub",
                    isSubActive
                      ? "bg-gray-100 text-[var(--primary)] font-bold"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900",
                  )}
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors",
                      isSubActive
                        ? "bg-[var(--primary)]"
                        : "bg-gray-300 group-hover/sub:bg-[var(--primary)]",
                    )}
                  />
                  <span className="text-xs truncate">{sub.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountMenu = ({
  user,
  handleLogout,
  panelClassName,
}: {
  user: any;
  handleLogout: () => void;
  panelClassName?: string;
}) => (
  <div className="absolute right-0 top-full pt-1 w-60 hidden group-hover:block z-[99999] animate-in fade-in zoom-in-95">
    <div
      className={
        panelClassName ??
        "rounded-2xl border border-gray-100 p-2.5 bg-white/95 backdrop-blur-md shadow-2xl space-y-1"
      }
    >
      <div className="px-3 py-2 border-b border-gray-100 mb-1.5">
        <p className="font-bold text-sm text-gray-900 truncate">
          {user?.name || "Lumina User"}
        </p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">
          {user?.email}
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <LayoutDashboard size={15} /> My Dashboard
      </Link>
      <Link
        href="/dashboard/orders"
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <ShoppingCart size={15} /> Order History
      </Link>
      <div className="h-px bg-gray-100 my-1" />
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
      >
        <LogOut size={15} /> Logout
      </button>
    </div>
  </div>
);

function Navbar1Internal() {
  const {
    isOpen,
    setIsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isMounted,
    headerLinks,
    isLinkActive,
    user,
    isAuthenticated,
    handleLogout,
    totalCartCount,
    wishlistCount,
    dynamicStyles,
    logoImage,
  } = useNavbarState();

  const overlayVariants: Variants = {
    closed: {
      clipPath: "circle(0% at 100% 0%)",
      transition: { duration: 0.4 },
    },
    open: {
      clipPath: "circle(150% at 100% 0%)",
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  const listVariants: Variants = {
    open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
    closed: {},
  };
  const itemVariants: Variants = {
    closed: { opacity: 0, y: 16 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <>
      <nav
        style={dynamicStyles}
        className="fixed top-0 left-0 w-full z-[100] bg-white/75 backdrop-blur-xl border-b border-gray-100"
      >
        <TopNav />
        <div className="lg:w-3/4 mx-auto px-6 md:px-12 h-20 grid grid-cols-3 items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[var(--primary)] transition-colors cursor-pointer"
              title="Search catalogue"
            >
              <Search size={19} />
            </button>
          </div>

          <div className="flex justify-center">
            {logoImage ? (
              <Link href="/" className="relative h-9 w-32 block">
                <Image
                  src={logoImage}
                  alt="Brand Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </Link>
            ) : (
              <Logo />
            )}
          </div>

          <div className="flex items-center justify-end gap-1">
            <ul className="hidden md:flex items-center gap-7 mr-6">
              {headerLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                const hasSubs = Boolean(
                  link.subCategories && link.subCategories?.length > 0,
                );

                return (
                  <li key={link.label} className="relative group py-3">
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 text-sm font-semibold transition-colors hover:text-[var(--primary)] ${
                        isActive ? "text-[var(--primary)]" : "text-gray-600"
                      }`}
                    >
                      <span>{link.label}</span>
                      {hasSubs && (
                        <ChevronDown
                          size={13}
                          className="text-gray-400 group-hover:rotate-180 transition-transform duration-200"
                        />
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="navbar1-active"
                          className="absolute -bottom-0.5 left-0 w-full h-0.5"
                          style={{ backgroundColor: "var(--primary)" }}
                        />
                      )}
                    </Link>
                    {hasSubs && (
                      <CategoryPopup link={link} isLinkActive={isLinkActive} />
                    )}
                  </li>
                );
              })}
            </ul>

            {isMounted && isAuthenticated ? (
              <div className="relative group py-2">
                <button
                  type="button"
                  className="p-2.5 text-gray-700 hover:text-[var(--primary)] rounded-full cursor-pointer hover:bg-gray-100/60 transition-colors"
                >
                  <User size={19} />
                </button>
                <AccountMenu user={user} handleLogout={handleLogout} />
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 text-gray-700 hover:text-[var(--primary)] transition-colors"
              >
                <User size={19} />
              </Link>
            )}

            <Link
              href="/wishlist"
              className="p-2 text-gray-700 hover:text-[var(--primary)] transition-colors relative"
            >
              <Heart size={19} />
              {isMounted && wishlistCount > 0 && (
                <span
                  className="absolute top-1 right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="p-2 text-gray-700 hover:text-[var(--primary)] transition-colors relative"
            >
              <ShoppingBag size={19} />
              {isMounted && totalCartCount > 0 && (
                <span
                  className="absolute top-1 right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {totalCartCount > 99 ? "99+" : totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 top-20 bg-white md:hidden z-[-1] overflow-y-auto"
            >
              <motion.ul
                variants={listVariants}
                initial="closed"
                animate="open"
                className="flex flex-col items-start p-8 pt-10 space-y-6"
              >
                {headerLinks.map((link) => {
                  const isActive = isLinkActive(link.href);
                  return (
                    <motion.li
                      key={link.label}
                      variants={itemVariants}
                      className="w-full"
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-2xl font-bold transition-colors block",
                          isActive
                            ? "text-[var(--primary)]"
                            : "text-gray-900 hover:text-[var(--primary)]",
                        )}
                      >
                        {link.label}
                      </Link>
                      {link.subCategories && link.subCategories?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2.5 pl-2">
                          {link.subCategories.map((sub) => {
                            const isSubActive = isLinkActive(sub.href);
                            return (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "text-xs font-semibold px-3 py-1 rounded-full transition-colors",
                                  isSubActive
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                                )}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </motion.li>
                  );
                })}

                <motion.li
                  variants={itemVariants}
                  className="pt-6 w-full border-t border-gray-100 space-y-4"
                >
                  {isAuthenticated ? (
                    <>
                      <p className="text-sm font-black text-gray-900 uppercase tracking-wider">
                        Hi, {user?.name || "User"}
                      </p>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        <LayoutDashboard size={18} className="mr-2" /> Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center text-sm font-bold text-red-500 cursor-pointer"
                      >
                        <LogOut size={18} className="mr-2" /> Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center text-sm font-medium text-gray-600"
                    >
                      <User size={18} className="mr-2" /> Account Login
                    </Link>
                  )}
                  <Link
                    href="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between text-sm font-medium text-gray-600 hover:text-[var(--primary)]"
                  >
                    <div className="flex items-center">
                      <Heart size={18} className="mr-2" /> Wishlist
                    </div>
                    {isMounted && wishlistCount > 0 && (
                      <span
                        className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

function Navbar2Internal() {
  const {
    isOpen,
    setIsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isMounted,
    headerLinks,
    isLinkActive,
    user,
    isAuthenticated,
    handleLogout,
    totalCartCount,
    wishlistCount,
    dynamicStyles,
    logoImage,
  } = useNavbarState();

  const menuVariants: Variants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.25 } },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <>
      <nav
        style={dynamicStyles}
        className="fixed top-0 left-0 w-full z-[100] pt-4 px-4 md:px-8"
      >
        <TopNav />
        <div className="lg:w-3/4 mx-auto bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            {logoImage ? (
              <Link href="/" className="relative h-8 w-28 block">
                <Image
                  src={logoImage}
                  alt="Brand Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </Link>
            ) : (
              <Logo />
            )}
          </div>

          <ul className="hidden md:flex items-center gap-1 bg-gray-50/80 rounded-full p-1">
            {headerLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              const hasSubs = Boolean(
                link.subCategories && link.subCategories?.length > 0,
              );

              return (
                <li key={link.label} className="relative group py-1">
                  <Link
                    href={link.href}
                    className={`relative z-10 flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span>{link.label}</span>
                    {hasSubs && (
                      <ChevronDown
                        size={12}
                        className={cn(
                          "transition-transform duration-200 group-hover:rotate-180",
                          isActive ? "text-white" : "text-gray-400",
                        )}
                      />
                    )}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="navbar2-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: "var(--primary)" }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  {hasSubs && (
                    <CategoryPopup link={link} isLinkActive={isLinkActive} />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1 bg-gray-50/80 rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[var(--primary)] rounded-full transition-colors cursor-pointer"
              title="Search catalogue"
            >
              <Search size={17} />
            </button>

            {isMounted && isAuthenticated ? (
              <div className="relative group">
                <button
                  type="button"
                  className="p-2 text-gray-700 hover:text-[var(--primary)] rounded-full cursor-pointer transition-colors"
                >
                  <User size={17} />
                </button>
                <AccountMenu user={user} handleLogout={handleLogout} />
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 text-gray-700 hover:text-[var(--primary)] rounded-full transition-colors"
              >
                <User size={17} />
              </Link>
            )}

            <Link
              href="/wishlist"
              className="p-2 text-gray-700 hover:text-[var(--primary)] rounded-full transition-colors relative"
            >
              <Heart size={17} />
              {isMounted && wishlistCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center animate-in zoom-in"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="p-2 text-gray-700 hover:text-[var(--primary)] rounded-full transition-colors relative"
            >
              <ShoppingBag size={17} />
              {isMounted && totalCartCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center animate-in zoom-in"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {totalCartCount > 9 ? "9+" : totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:w-3/4 mx-auto overflow-hidden md:hidden"
            >
              <div className="mt-3 bg-white border border-gray-100 rounded-3xl shadow-xl p-6 space-y-4">
                {headerLinks.map((link) => {
                  const isActive = isLinkActive(link.href);
                  return (
                    <div key={link.label} className="space-y-2">
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block text-lg font-bold transition-colors",
                          isActive
                            ? "text-[var(--primary)]"
                            : "text-gray-900 hover:text-[var(--primary)]",
                        )}
                      >
                        {link.label}
                      </Link>
                      {link.subCategories && link.subCategories?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-2">
                          {link.subCategories.map((sub) => {
                            const isSubActive = isLinkActive(sub.href);
                            return (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "text-xs px-2.5 py-1 rounded-full transition-colors",
                                  isSubActive
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-600",
                                )}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-gray-100">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center text-sm font-bold text-red-500 cursor-pointer"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center text-sm font-medium text-gray-600"
                    >
                      <User size={16} className="mr-2" /> Account Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

function Navbar3Internal() {
  const {
    isOpen,
    setIsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isMounted,
    headerLinks,
    isLinkActive,
    user,
    isAuthenticated,
    handleLogout,
    totalCartCount,
    wishlistCount,
    dynamicStyles,
    logoImage,
  } = useNavbarState();

  const drawerVariants: Variants = {
    closed: { x: "100%", transition: { duration: 0.3, ease: "easeIn" } },
    open: { x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <>
      <nav
        style={dynamicStyles}
        className="fixed top-0 left-0 w-full z-[100] bg-white border-b border-gray-100"
      >
        <TopNav />
        <div className="lg:w-3/4 mx-auto px-6 md:px-12 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            {logoImage ? (
              <Link href="/" className="relative h-8 w-28 block">
                <Image
                  src={logoImage}
                  alt="Brand Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </Link>
            ) : (
              <Logo />
            )}

            <ul className="hidden md:flex items-center gap-7">
              {headerLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                const hasSubs = Boolean(
                  link.subCategories && link.subCategories?.length > 0,
                );

                return (
                  <li key={link.label} className="relative group py-5">
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 text-sm font-semibold transition-colors hover:text-[var(--primary)] ${
                        isActive ? "text-[var(--primary)]" : "text-gray-600"
                      }`}
                    >
                      <span>{link.label}</span>
                      {hasSubs && (
                        <ChevronDown
                          size={13}
                          className="text-gray-400 group-hover:rotate-180 transition-transform duration-200"
                        />
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="navbar3-active"
                          className="absolute -bottom-[1px] left-0 w-full h-[2px]"
                          style={{ backgroundColor: "var(--primary)" }}
                        />
                      )}
                    </Link>
                    {hasSubs && (
                      <CategoryPopup link={link} isLinkActive={isLinkActive} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[var(--primary)] transition-colors cursor-pointer"
              title="Search catalogue"
            >
              <Search size={19} />
            </button>

            {isMounted && isAuthenticated ? (
              <div className="relative group py-2 hidden md:block">
                <button
                  type="button"
                  className="p-2.5 text-gray-700 hover:text-[var(--primary)] rounded-full cursor-pointer hover:bg-gray-100/60 transition-colors"
                >
                  <User size={19} />
                </button>
                <AccountMenu user={user} handleLogout={handleLogout} />
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex p-2 text-gray-700 hover:text-[var(--primary)] transition-colors"
              >
                <User size={19} />
              </Link>
            )}

            <Link
              href="/wishlist"
              className="hidden md:flex p-2 text-gray-700 hover:text-[var(--primary)] transition-colors relative"
            >
              <Heart size={19} />
              {isMounted && wishlistCount > 0 && (
                <span
                  className="absolute top-1 right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="p-2 text-gray-700 hover:text-[var(--primary)] transition-colors relative"
            >
              <ShoppingBag size={19} />
              {isMounted && totalCartCount > 0 && (
                <span
                  className="absolute top-1 right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {totalCartCount > 99 ? "99+" : totalCartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] md:hidden"
              />
              <motion.div
                variants={drawerVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed top-0 right-0 h-full w-[82%] max-w-sm bg-white z-[101] md:hidden shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  {logoImage ? (
                    <div className="relative h-8 w-24">
                      <Image
                        src={logoImage}
                        alt="Brand Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Logo />
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>
                <div className="flex flex-col p-6 space-y-6 overflow-y-auto">
                  {headerLinks.map((link) => {
                    const isActive = isLinkActive(link.href);
                    return (
                      <div key={link.label} className="space-y-2">
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-xl font-bold transition-colors block",
                            isActive
                              ? "text-[var(--primary)]"
                              : "text-gray-900 hover:text-[var(--primary)]",
                          )}
                        >
                          {link.label}
                        </Link>
                        {link.subCategories &&
                          link.subCategories?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pl-2">
                              {link.subCategories.map((sub) => {
                                const isSubActive = isLinkActive(sub.href);
                                return (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                      "text-xs px-2.5 py-1 rounded-full transition-colors",
                                      isSubActive
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-600",
                                    )}
                                  >
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    );
                  })}
                  <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                    {isAuthenticated ? (
                      <>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-wider">
                          Hi, {user?.name || "User"}
                        </p>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center text-sm font-medium text-gray-600 hover:text-[var(--primary)]"
                        >
                          <LayoutDashboard size={18} className="mr-2" />{" "}
                          Dashboard
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center text-sm font-bold text-red-500 text-left cursor-pointer"
                        >
                          <LogOut size={18} className="mr-2" /> Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-[var(--primary)]"
                      >
                        <User size={18} className="mr-2" /> Account Login
                      </Link>
                    )}
                    <Link
                      href="/wishlist"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between text-sm font-medium text-gray-600 hover:text-[var(--primary)]"
                    >
                      <div className="flex items-center">
                        <Heart size={18} className="mr-2" /> Wishlist
                      </div>
                      {isMounted && wishlistCount > 0 && (
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--primary)" }}
                        >
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

export function Navbar1() {
  return (
    <React.Suspense fallback={<Navbar1Preview />}>
      <Navbar1Internal />
    </React.Suspense>
  );
}

export function Navbar2() {
  return (
    <React.Suspense fallback={<Navbar2Preview />}>
      <Navbar2Internal />
    </React.Suspense>
  );
}

export function Navbar3() {
  return (
    <React.Suspense fallback={<Navbar3Preview />}>
      <Navbar3Internal />
    </React.Suspense>
  );
}

export function Navbar1Preview({ themeData }: { themeData?: any }) {
  const pColor = themeData?.primaryColor || "#111827";
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-2 overflow-hidden">
      <div className="h-2 w-full bg-gray-900/10 rounded-full" />
      <div className="grid grid-cols-3 items-center py-1">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-gray-300" />
          <div className="h-2 w-8 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-center">
          {themeData?.logo ? (
            <div className="relative h-4 w-14">
              <img
                src={themeData.logo}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-4 w-14 bg-gray-900 rounded font-black text-[8px] text-white flex items-center justify-center">
              LOGO
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <div className="h-2 w-6 rounded bg-gray-200" />
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: pColor }}
          />
        </div>
      </div>
    </div>
  );
}

export function Navbar2Preview({ themeData }: { themeData?: any }) {
  const pColor = themeData?.primaryColor || "#111827";
  return (
    <div className="w-full bg-gray-50/50 rounded-xl border border-gray-200 p-3 flex items-center justify-between shadow-sm overflow-hidden">
      {themeData?.logo ? (
        <div className="relative h-4 w-12">
          <img
            src={themeData.logo}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="h-4 w-12 bg-gray-900 rounded font-black text-[8px] text-white flex items-center justify-center">
          LOGO
        </div>
      )}
      <div className="flex items-center gap-1 bg-white border rounded-full px-2 py-1 shadow-xs">
        <div
          className="h-2 w-6 rounded-full"
          style={{ backgroundColor: pColor }}
        />
        <div className="h-2 w-6 rounded-full bg-gray-200" />
        <div className="h-2 w-6 rounded-full bg-gray-200" />
      </div>
      <div className="flex items-center gap-1 bg-white border rounded-full p-1 shadow-xs">
        <div className="h-3 w-3 rounded-full bg-gray-300" />
        <div className="h-3 w-3 rounded-full bg-gray-300" />
      </div>
    </div>
  );
}

export function Navbar3Preview({ themeData }: { themeData?: any }) {
  const pColor = themeData?.primaryColor || "#111827";
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-2.5 space-y-2 overflow-hidden">
      <div className="flex items-center justify-between text-[7px] text-gray-400 font-mono border-b pb-1">
        <span>Free express delivery</span>
        <span>Hotline: +8801700</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {themeData?.logo ? (
            <div className="relative h-4 w-12">
              <img
                src={themeData.logo}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-4 w-12 bg-gray-900 rounded font-black text-[8px] text-white flex items-center justify-center">
              LOGO
            </div>
          )}
          <div className="flex gap-1">
            <div
              className="h-2 w-5 rounded"
              style={{ backgroundColor: pColor }}
            />
            <div className="h-2 w-5 rounded bg-gray-200" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded bg-gray-200" />
          <div className="h-3 w-3 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function NavbarContent() {
  const { data: themeData } = useTheme();
  const layout = themeData?.navbar?.layout || 1;

  if (layout === 2) {
    return <Navbar2 />;
  }

  if (layout === 3) {
    return <Navbar3 />;
  }

  return <Navbar1 />;
}

export default function Navbar() {
  return (
    <React.Suspense fallback={<div className="h-20 w-full" />}>
      <NavbarContent />
    </React.Suspense>
  );
}
