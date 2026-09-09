import { create } from "zustand";

interface FooterLink {
  label: string;
  href: string;
}

interface LayoutState {
  logo: string;
  themeColor: string; // Primary color for buttons/links
  navLinks: FooterLink[];
  footer: {
    description: string;
    shoppingLinks: FooterLink[];
    companyLinks: FooterLink[];
    socials: { platform: string; icon: string; url: string }[];
  };
}

export const useLayoutStore = create<LayoutState>(() => ({
  logo: "LuxeCommerce",
  themeColor: "#0047AB",
  navLinks: [
    { label: "Shop All", href: "/shop" },
    { label: "New Arrivals", href: "/shop/new" },
    { label: "Best Sellers", href: "/shop/best" },
    { label: "Featured", href: "/shop/featured" },
    { label: "About", href: "/about" },
  ],
  footer: {
    description:
      "The future of premium eCommerce SaaS. Clean, fast, and remarkably beautiful.",
    shoppingLinks: [
      { label: "Sustainability", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Wholesale", href: "#" },
      { label: "Gift Cards", href: "#" },
    ],
    companyLinks: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
    ],
    socials: [
      { platform: "global", icon: "Globe", url: "#" },
      { platform: "instagram", icon: "Instagram", url: "#" },
      { platform: "share", icon: "Share2", url: "#" },
    ],
  },
}));
