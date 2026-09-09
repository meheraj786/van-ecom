"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  Footprints,
  Globe,
  ImageIcon,
  Layout,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Tv,
} from "lucide-react";
import { useTheme, useUpdateTheme, useResetTheme } from "@/hooks/useTheme";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "brand", label: "Brand & Header", icon: Palette },
  { id: "product", label: "Product Layouts", icon: Package },
  { id: "chat-social", label: "Social & Chat", icon: MessageCircle },
  { id: "seo", label: "SEO & Analytics", icon: Globe },
  { id: "home", label: "Home Sections", icon: Layout },
  { id: "showcase", label: "Showcase Pages", icon: Tv },
  { id: "about", label: "About Us Story", icon: FileText },
  { id: "contact", label: "Contact Info", icon: Mail },
  { id: "footer", label: "Footer & Reset", icon: Footprints },
];

const SHOWCASE_PAGE_OPTIONS = [
  "New Arrivals",
  "Best Sellers",
  "Featured Items",
];

const MAX_HEADER_MENUS = 7;

const PRESET_COLLECTIONS = [
  "Featured Collection",
  "Best Sellers",
  "New Arrivals",
  "Flash Sale",
  "Trending Now",
  "Special Discount Items",
  "Limited Edition",
];

const CATEGORY_BLOCK_LAYOUTS = [
  { id: 1, name: "Grid Cards" },
  { id: 2, name: "Curated Split" },
  { id: 3, name: "Horizontal Carousel" },
];

const PRODUCT_SHOWCASE_LAYOUTS = [
  { id: 1, name: "Scrollable Row" },
  { id: 2, name: "Editorial Split" },
  { id: 3, name: "Product Grid" },
];

const DEFAULT_THEME = {
  logo: "",
  favicon: "",
  primaryColor: "#111827",
  navbar: {
    layout: 1,
    menus: [],
  },
  product: {
    cardLayout: 1,
    detailLayout: 1,
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    tiktok: "",
    linkedin: "",
  },
  chat: {
    whatsappNumber: "8801700000000",
    messengerUsername: "luminastore",
    telegramUsername: "",
    isWhatsappEnabled: true,
    isMessengerEnabled: true,
  },
  seo: {
    metaTitle: "Lumina - Curated Modern Lifestyle Store",
    metaDescription:
      "Explore dynamic product configurations, minimal apparel, and everyday lifestyle essentials.",
    keywords: ["ecommerce", "lumina", "lifestyle", "store"],
    ogImage: "",
    canonicalUrl: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
  },
  banner: {
    layout: 1,
    slogan: "Elevate Your Everyday",
    paragraph: "Curated lifestyle pieces built with precision and durability.",
    bgImg: [],
    productId: [],
    categoryId: "",
  },
  shopByCategoryOrSubcategory: [],
  productBy: [],
  sale: {
    name: "Seasonal Flash Sale",
    title: "Up to 50% Off Selected Collections",
    para: "Limited time promotion across all essential apparel and tech.",
    link: "/shop",
    coupon: "LUMINA50",
    bgColor: "#111827",
  },
  newPage: {
    bgImg: "",
    bgColor: "#f8f9fb",
    title: "Curated Collection",
    slogan: "Discover the latest additions to our catalogue",
  },
  featuredPage: {
    bgImg: "",
    bgColor: "#f8f9fb",
    title: "Featured Collection",
    slogan: "Handpicked pieces for the season",
  },
  bestPage: {
    bgImg: "",
    bgColor: "#f8f9fb",
    title: "Best Sellers",
    slogan: "Most loved by our community",
  },
  footer: {
    layout: 1,
    copyright: "© 2026 Lumina. All rights reserved.",
    contactInfo: "support@lumina.com | +880 1700-000000",
  },
  aboutPage: {
    badge: "Since 2019",
    heading: "Designing everyday",
    highlightText: "essentials",
    headingSuffix: "that last.",
    intro:
      "We started with a simple question: why does buying something that lasts have to mean giving up on good design?",
    mission: {
      title: "Our mission",
      body: "To make thoughtfully designed, genuinely durable goods accessible without the premium markup.",
    },
    stats: [
      { label: "Founded", value: "2019" },
      { label: "Orders shipped", value: "120K+" },
      { label: "Countries served", value: "24" },
      { label: "Average rating", value: "4.8/5" },
    ],
    values: [
      {
        icon: "Leaf",
        title: "Sustainable by default",
        description:
          "Responsibly sourced materials and packaging that doesn't end up as waste.",
      },
      {
        icon: "ShieldCheck",
        title: "Built to last",
        description:
          "Every piece is stress-tested well past what a normal return policy requires.",
      },
      {
        icon: "Users",
        title: "Community first",
        description:
          "Product decisions start from customer feedback, not the other way around.",
      },
      {
        icon: "Sparkles",
        title: "Considered design",
        description:
          "Nothing ships until it earns its place — no filler, no unnecessary variants.",
      },
    ],
    timeline: [
      {
        year: "2019",
        title: "The idea",
        description:
          "Started in a spare room with one product and a list of frustrations with alternatives.",
      },
      {
        year: "2021",
        title: "First storefront",
        description:
          "Opened our first small studio space and shipped our 10,000th order.",
      },
      {
        year: "2023",
        title: "Going global",
        description: "Expanded shipping to 24 countries and grew the team.",
      },
      {
        year: "2025",
        title: "Today",
        description:
          "Still run with the same care, asking the same question about every product.",
      },
    ],
    quote: {
      text: "We'd rather ship four things a year that we're proud of than forty that we're not.",
      author: "Amara Chowdhury, Founder",
    },
    cta: {
      title: "Join the journey.",
      description:
        "Shop the current collection, or reach out if you’d like to work with us.",
      primaryBtn: "Shop the collection",
      secondaryBtn: "Get in touch",
    },
  },
  contact: {
    title: "Get in touch",
    description: "We can’t wait to hear from you.",
    mail: "Email",
    phone: "Phone",
    address: "Address",
  },
};

function CollapsibleSection({
  title,
  description,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
      >
        <div className="text-left flex-1">
          <h3 className="font-bold text-sm text-gray-900">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-5 bg-gray-50/30 border-t border-gray-200 space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdminThemeEditorPage() {
  const { data: themeData, isLoading } = useTheme();
  const updateThemeMutation = useUpdateTheme();
  const resetThemeMutation = useResetTheme();

  const { data: categoriesResponse } = useCategories(1, 100);
  const { data: productsResponse } = useProducts({ page: 1, limit: 100 });

  const categories = React.useMemo(() => {
    const res = categoriesResponse as any;
    const categoryData =
      res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    return Array.isArray(categoryData) ? categoryData : [];
  }, [categoriesResponse]);

  const allSubCategories = React.useMemo(() => {
    const list: any[] = [];
    categories.forEach((cat: any) => {
      if (cat.subCategories && Array.isArray(cat.subCategories)) {
        cat.subCategories.forEach((sub: any) => {
          list.push({ ...sub, parentCategoryName: cat.name });
        });
      }
    });
    return list;
  }, [categories]);

  const products = React.useMemo(() => {
    const res = productsResponse as any;
    const productData =
      res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    return Array.isArray(productData) ? productData : [];
  }, [productsResponse]);

  const [activeSection, setActiveSection] = React.useState("brand");
  const [formData, setFormData] = React.useState<any>(DEFAULT_THEME);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const [bannerOption, setBannerOption] = React.useState<
    "image" | "category" | "product"
  >("image");

  const [showcasePageStyles, setShowcasePageStyles] = React.useState<
    Record<string, "color" | "image">
  >({
    newPage: "image",
    featuredPage: "color",
    bestPage: "color",
  });

  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({
    "brand-visual": true,
    "brand-navbar": true,
    "product-layout": true,
    "chat-config": true,
    "social-links": true,
    "seo-meta": true,
    "home-banner": true,
    "home-category": true,
    "home-products": true,
    "home-sale": true,
    "showcase-new": true,
    "showcase-featured": true,
    "showcase-best": true,
    "about-story": true,
    "about-stats": true,
    "about-values": true,
    "about-timeline": true,
    "about-mission": true,
    "about-quote": true,
    "about-cta": true,
    "contact-main": true,
    "footer-main": true,
  });

  React.useEffect(() => {
    if (themeData) {
      const cloned = JSON.parse(JSON.stringify(themeData));

      const merged = {
        ...DEFAULT_THEME,
        ...cloned,
        navbar: { ...DEFAULT_THEME.navbar, ...cloned.navbar },
        product: { ...DEFAULT_THEME.product, ...cloned.product },
        socialLinks: { ...DEFAULT_THEME.socialLinks, ...cloned.socialLinks },
        chat: { ...DEFAULT_THEME.chat, ...cloned.chat },
        seo: { ...DEFAULT_THEME.seo, ...cloned.seo },
        banner: { ...DEFAULT_THEME.banner, ...cloned.banner },
        sale: { ...DEFAULT_THEME.sale, ...cloned.sale },
        newPage: { ...DEFAULT_THEME.newPage, ...cloned.newPage },
        featuredPage: { ...DEFAULT_THEME.featuredPage, ...cloned.featuredPage },
        bestPage: { ...DEFAULT_THEME.bestPage, ...cloned.bestPage },
        footer: { ...DEFAULT_THEME.footer, ...cloned.footer },
        aboutPage: {
          ...DEFAULT_THEME.aboutPage,
          ...cloned.aboutPage,
          mission: {
            ...DEFAULT_THEME.aboutPage.mission,
            ...cloned.aboutPage?.mission,
          },
          quote: {
            ...DEFAULT_THEME.aboutPage.quote,
            ...cloned.aboutPage?.quote,
          },
          cta: { ...DEFAULT_THEME.aboutPage.cta, ...cloned.aboutPage?.cta },
        },
        contact: { ...DEFAULT_THEME.contact, ...cloned.contact },
      };

      if (
        merged.shopByCategoryOrSubcategory &&
        !Array.isArray(merged.shopByCategoryOrSubcategory)
      ) {
        merged.shopByCategoryOrSubcategory = [
          merged.shopByCategoryOrSubcategory,
        ];
      }

      if (merged.banner) {
        if (merged.banner.layout === 2 || merged.banner.categoryId) {
          setBannerOption("category");
        } else if (
          merged.banner.layout === 3 ||
          (merged.banner.productId && merged.banner.productId?.length > 0)
        ) {
          setBannerOption("product");
        } else {
          setBannerOption("image");
        }
      }

      setShowcasePageStyles({
        newPage: merged.newPage?.bgImg ? "image" : "color",
        featuredPage: merged.featuredPage?.bgImg ? "image" : "color",
        bestPage: merged.bestPage?.bgImg ? "image" : "color",
      });

      setFormData(merged);
    }
  }, [themeData]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0e14] text-white flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-2xl shadow-blue-500/20 animate-pulse flex items-center justify-center">
            <div className="h-full w-full bg-[#0c0e14] rounded-[22px] flex items-center justify-center">
              <Palette
                className="h-8 w-8 text-blue-400 animate-spin"
                style={{ animationDuration: "6s" }}
              />
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
        </div>

        <div className="text-center space-y-2 max-w-sm">
          <Badge
            variant="outline"
            className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-white/5 border-white/10 text-blue-400"
          >
            Lumina Theme Studio
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-white/90">
            Initializing Visual Engine
          </h2>
          <p className="text-xs text-white/40 leading-relaxed font-mono">
            Loading design tokens, dynamic layouts, and storefront components...
          </p>
        </div>

        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateThemeMutation.mutateAsync(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    try {
      await resetThemeMutation.mutateAsync();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const addNavbarMenu = (name: string) => {
    if (!name) return;
    const current = formData.navbar?.menus || [];
    if (current?.length >= MAX_HEADER_MENUS) return;
    if (!current.includes(name)) {
      setFormData({
        ...formData,
        navbar: {
          ...formData.navbar,
          menus: [...current, name],
        },
      });
    }
  };

  const removeNavbarMenu = (name: string) => {
    const current = formData.navbar?.menus || [];
    setFormData({
      ...formData,
      navbar: {
        ...formData.navbar,
        menus: current.filter((m: string) => m !== name),
      },
    });
  };

  const addBannerProduct = (prodId: string) => {
    if (!prodId) return;
    const current = formData.banner?.productId || [];
    if (!current.includes(prodId)) {
      setFormData({
        ...formData,
        banner: {
          ...formData.banner,
          productId: [...current, prodId],
        },
      });
    }
  };

  const removeBannerProduct = (prodId: string) => {
    const current = formData.banner?.productId || [];
    setFormData({
      ...formData,
      banner: {
        ...formData.banner,
        productId: current.filter((id: string) => id !== prodId),
      },
    });
  };

  const addCategoryShowcaseBlock = () => {
    const current = formData.shopByCategoryOrSubcategory || [];
    setFormData({
      ...formData,
      shopByCategoryOrSubcategory: [
        ...current,
        {
          layout: 1,
          catOrsubCatIds: [],
          max: 4,
        },
      ],
    });
  };

  const removeCategoryShowcaseBlock = (idx: number) => {
    const updated = [...(formData.shopByCategoryOrSubcategory || [])];
    updated.splice(idx, 1);
    setFormData({ ...formData, shopByCategoryOrSubcategory: updated });
  };

  const addCategoryToShowcaseBlock = (blockIdx: number, catId: string) => {
    if (!catId) return;
    const updatedBlocks = [...(formData.shopByCategoryOrSubcategory || [])];
    const currentList = updatedBlocks[blockIdx]?.catOrsubCatIds || [];
    if (!currentList.includes(catId) && currentList?.length < 4) {
      updatedBlocks[blockIdx].catOrsubCatIds = [...currentList, catId];
      updatedBlocks[blockIdx].max = 4;
      setFormData({ ...formData, shopByCategoryOrSubcategory: updatedBlocks });
    }
  };

  const removeCategoryFromShowcaseBlock = (blockIdx: number, catId: string) => {
    const updatedBlocks = [...(formData.shopByCategoryOrSubcategory || [])];
    const currentList = updatedBlocks[blockIdx]?.catOrsubCatIds || [];
    updatedBlocks[blockIdx].catOrsubCatIds = currentList.filter(
      (id: string) => id !== catId,
    );
    updatedBlocks[blockIdx].max = 4;
    setFormData({ ...formData, shopByCategoryOrSubcategory: updatedBlocks });
  };

  const addProductBySection = () => {
    const current = formData.productBy || [];
    setFormData({
      ...formData,
      productBy: [
        ...current,
        {
          layout: 1,
          catOrSubcatOrmenu: "Featured Collection",
          max: 8,
        },
      ],
    });
  };

  const removeProductBySection = (idx: number) => {
    const updated = [...(formData.productBy || [])];
    updated.splice(idx, 1);
    setFormData({ ...formData, productBy: updated });
  };

  const addAboutStat = () => {
    const current = formData.aboutPage?.stats || [];
    setFormData({
      ...formData,
      aboutPage: {
        ...formData.aboutPage,
        stats: [...current, { label: "New Stat", value: "100+" }],
      },
    });
  };

  const removeAboutStat = (idx: number) => {
    const updated = [...(formData.aboutPage?.stats || [])];
    updated.splice(idx, 1);
    setFormData({
      ...formData,
      aboutPage: { ...formData.aboutPage, stats: updated },
    });
  };

  const addAboutValue = () => {
    const current = formData.aboutPage?.values || [];
    setFormData({
      ...formData,
      aboutPage: {
        ...formData.aboutPage,
        values: [
          ...current,
          {
            icon: "Sparkles",
            title: "Value Title",
            description: "Value description...",
          },
        ],
      },
    });
  };

  const removeAboutValue = (idx: number) => {
    const updated = [...(formData.aboutPage?.values || [])];
    updated.splice(idx, 1);
    setFormData({
      ...formData,
      aboutPage: { ...formData.aboutPage, values: updated },
    });
  };

  const addAboutTimeline = () => {
    const current = formData.aboutPage?.timeline || [];
    setFormData({
      ...formData,
      aboutPage: {
        ...formData.aboutPage,
        timeline: [
          ...current,
          {
            year: new Date().getFullYear().toString(),
            title: "Milestone",
            description: "Milestone description...",
          },
        ],
      },
    });
  };

  const removeAboutTimeline = (idx: number) => {
    const updated = [...(formData.aboutPage?.timeline || [])];
    updated.splice(idx, 1);
    setFormData({
      ...formData,
      aboutPage: { ...formData.aboutPage, timeline: updated },
    });
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "brand":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Visual Identity"
              description="Logos, browser favicon, and primary theme accent color"
              isOpen={expandedSections["brand-visual"]}
              onToggle={() => toggleSection("brand-visual")}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider text-gray-700">
                      Store Brand Logo
                    </Label>
                    <ImageUpload
                      value={formData.logo || ""}
                      onChange={(url) =>
                        setFormData({ ...formData, logo: url })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider text-gray-700">
                      Favicon (Browser Tab Icon)
                    </Label>
                    <ImageUpload
                      value={formData.favicon || ""}
                      onChange={(url) =>
                        setFormData({ ...formData, favicon: url })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <Label className="font-bold text-xs uppercase tracking-wider text-gray-700 block">
                    Primary Accent Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor || "#111827"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryColor: e.target.value,
                        })
                      }
                      className="h-12 w-16 rounded-xl border border-gray-300 cursor-pointer bg-white"
                    />
                    <Input
                      value={formData.primaryColor || "#111827"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryColor: e.target.value,
                        })
                      }
                      className="font-mono text-xs font-bold uppercase max-w-xs"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Navigation Bar"
              description="Header layout style and category menu links"
              isOpen={expandedSections["brand-navbar"]}
              onToggle={() => toggleSection("brand-navbar")}
            >
              <div className="space-y-6">
                <div>
                  <Label className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2.5 block">
                    Navbar Layout Style
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 1, name: "Split Center (Standard)" },
                      { id: 2, name: "Floating Pill" },
                      { id: 3, name: "Two-Tier Utility" },
                    ].map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            navbar: {
                              ...formData.navbar,
                              layout: variant.id,
                            },
                          });
                        }}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all font-bold text-xs cursor-pointer",
                          formData.navbar?.layout === variant.id
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                        )}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-bold text-xs uppercase tracking-wider text-gray-700 block">
                        Header Menu Links
                      </Label>
                      <p className="text-[11px] text-gray-500">
                        Choose showcase pages or main categories (Maximum{" "}
                        {MAX_HEADER_MENUS} items total)
                      </p>
                    </div>
                    <Badge
                      variant={
                        (formData.navbar?.menus || [])?.length >=
                        MAX_HEADER_MENUS
                          ? "destructive"
                          : "secondary"
                      }
                      className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full"
                    >
                      {(formData.navbar?.menus || [])?.length} /{" "}
                      {MAX_HEADER_MENUS} added
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[50px] p-2.5 rounded-xl bg-gray-50 border border-gray-200 items-center">
                    {(formData.navbar?.menus || [])?.length === 0 ? (
                      <span className="text-xs text-gray-400 m-auto">
                        No links added yet. Pick from the dropdown below.
                      </span>
                    ) : (
                      (formData.navbar?.menus || []).map((menuName: string) => (
                        <Badge
                          key={menuName}
                          variant="secondary"
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs font-bold gap-2 shadow-xs rounded-lg"
                        >
                          <span>{menuName}</span>
                          <button
                            type="button"
                            onClick={() => removeNavbarMenu(menuName)}
                            className="hover:text-red-500 cursor-pointer text-sm font-black leading-none"
                          >
                            &times;
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select
                      disabled={
                        (formData.navbar?.menus || [])?.length >=
                        MAX_HEADER_MENUS
                      }
                      onValueChange={(val) => addNavbarMenu(val)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 text-xs font-medium">
                        <SelectValue
                          placeholder={
                            (formData.navbar?.menus || [])?.length >=
                            MAX_HEADER_MENUS
                              ? "Maximum 7 items reached"
                              : "Add a Page or Category to Header..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-72">
                        <SelectGroup>
                          <SelectLabel className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                            Showcase Pages
                          </SelectLabel>
                          {SHOWCASE_PAGE_OPTIONS.map((pageName) => {
                            const isAdded = (
                              formData.navbar?.menus || []
                            ).includes(pageName);
                            return (
                              <SelectItem
                                key={pageName}
                                value={pageName}
                                disabled={isAdded}
                                className="cursor-pointer text-xs font-medium"
                              >
                                {pageName} {isAdded ? "(Already added)" : ""}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>

                        <SelectGroup className="mt-2 pt-2 border-t border-gray-100">
                          <SelectLabel className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Store Categories
                          </SelectLabel>
                          {categories.map((c: any) => {
                            const isAdded = (
                              formData.navbar?.menus || []
                            ).includes(c.name);
                            return (
                              <SelectItem
                                key={c.id}
                                value={c.name}
                                disabled={isAdded}
                                className="cursor-pointer text-xs"
                              >
                                Category: {c.name}{" "}
                                {isAdded ? "(Already added)" : ""}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case "product":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Product Display Layouts"
              description="Choose design styles for product cards and product detail pages"
              isOpen={expandedSections["product-layout"]}
              onToggle={() => toggleSection("product-layout")}
            >
              <div className="space-y-6">
                <div>
                  <Label className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2.5 block">
                    Product Card Grid Style
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 1,
                        name: "Layout 1: Minimalist",
                        desc: "Clean image focus with bottom bar",
                      },
                      {
                        id: 2,
                        name: "Layout 2: Modern Badge",
                        desc: "Rounded border with quick tags",
                      },
                      {
                        id: 3,
                        name: "Layout 3: Premium Hover",
                        desc: "Full action drawer and rating",
                      },
                    ].map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            product: {
                              ...formData.product,
                              cardLayout: variant.id,
                            },
                          });
                        }}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all font-bold text-xs cursor-pointer space-y-1",
                          (formData.product?.cardLayout || 1) === variant.id
                            ? "border-gray-900 bg-gray-900 text-white shadow-md"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                        )}
                      >
                        <div>{variant.name}</div>
                        <div
                          className={cn(
                            "text-[11px] font-normal",
                            (formData.product?.cardLayout || 1) === variant.id
                              ? "text-gray-300"
                              : "text-gray-500",
                          )}
                        >
                          {variant.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2.5 block">
                    Product Detail Page Layout
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 1,
                        name: "Layout 1: Split Gallery + Sticky Cart",
                        desc: "Left visual gallery, right sticky checkout box",
                      },
                      {
                        id: 2,
                        name: "Layout 2: Full-Width Editorial",
                        desc: "Immersive full width visuals with centered buy deck",
                      },
                    ].map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            product: {
                              ...formData.product,
                              detailLayout: variant.id,
                            },
                          });
                        }}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all font-bold text-xs cursor-pointer space-y-1",
                          (formData.product?.detailLayout || 1) === variant.id
                            ? "border-gray-900 bg-gray-900 text-white shadow-md"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                        )}
                      >
                        <div>{variant.name}</div>
                        <div
                          className={cn(
                            "text-[11px] font-normal",
                            (formData.product?.detailLayout || 1) === variant.id
                              ? "text-gray-300"
                              : "text-gray-500",
                          )}
                        >
                          {variant.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case "chat-social":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Live Chat Integrations"
              description="Floating chat buttons for WhatsApp, Messenger, and Telegram"
              isOpen={expandedSections["chat-config"]}
              onToggle={() => toggleSection("chat-config")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700">
                      WhatsApp Number
                    </Label>
                    <Input
                      placeholder="e.g. 8801700000000"
                      value={formData.chat?.whatsappNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chat: {
                            ...formData.chat,
                            whatsappNumber: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700">
                      Messenger Username / Page ID
                    </Label>
                    <Input
                      placeholder="e.g. luminastore"
                      value={formData.chat?.messengerUsername || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chat: {
                            ...formData.chat,
                            messengerUsername: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700">
                      Telegram Username
                    </Label>
                    <Input
                      placeholder="e.g. luminashop"
                      value={formData.chat?.telegramUsername || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chat: {
                            ...formData.chat,
                            telegramUsername: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.chat?.isWhatsappEnabled ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chat: {
                            ...formData.chat,
                            isWhatsappEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    Enable WhatsApp Button
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.chat?.isMessengerEnabled ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chat: {
                            ...formData.chat,
                            isMessengerEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    Enable Messenger Button
                  </label>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Social Media Links"
              description="Social channels displayed across the footer and contact sections"
              isOpen={expandedSections["social-links"]}
              onToggle={() => toggleSection("social-links")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "facebook", label: "Facebook Page URL" },
                  { key: "instagram", label: "Instagram Profile URL" },
                  { key: "youtube", label: "YouTube Channel URL" },
                  { key: "twitter", label: "X / Twitter URL" },
                  { key: "tiktok", label: "TikTok Profile URL" },
                  { key: "linkedin", label: "LinkedIn Page URL" },
                ].map((s) => (
                  <div key={s.key} className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      {s.label}
                    </Label>
                    <Input
                      placeholder="https://..."
                      value={formData.socialLinks?.[s.key] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: {
                            ...formData.socialLinks,
                            [s.key]: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        );

      case "seo":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Global SEO & Tracking Meta"
              description="Default page titles, metadata tags, open graph, and analytics tags"
              isOpen={expandedSections["seo-meta"]}
              onToggle={() => toggleSection("seo-meta")}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Default Meta Title
                  </Label>
                  <Input
                    value={formData.seo?.metaTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, metaTitle: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Default Meta Description
                  </Label>
                  <Textarea
                    rows={3}
                    value={formData.seo?.metaDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          metaDescription: e.target.value,
                        },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Keywords (comma-separated)
                  </Label>
                  <Input
                    value={
                      Array.isArray(formData.seo?.keywords)
                        ? formData.seo.keywords.join(", ")
                        : formData.seo?.keywords || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          keywords: e.target.value
                            .split(",")
                            .map((k) => k.trim()),
                        },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700">
                      Google Analytics Measurement ID
                    </Label>
                    <Input
                      placeholder="G-XXXXXXXXXX"
                      value={formData.seo?.googleAnalyticsId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: {
                            ...formData.seo,
                            googleAnalyticsId: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700">
                      Facebook Pixel ID
                    </Label>
                    <Input
                      placeholder="e.g. 123456789012345"
                      value={formData.seo?.facebookPixelId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: {
                            ...formData.seo,
                            facebookPixelId: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    OG Social Share Image
                  </Label>
                  <ImageUpload
                    value={formData.seo?.ogImage || ""}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, ogImage: url },
                      })
                    }
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case "home":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Hero Banner Section"
              description="Configure hero layout, headline, callout text, and imagery or product references"
              isOpen={expandedSections["home-banner"]}
              onToggle={() => toggleSection("home-banner")}
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "image",
                      label: "Image Carousel Banner",
                      layoutId: 1,
                    },
                    {
                      id: "category",
                      label: "Category Focused Banner",
                      layoutId: 2,
                    },
                    { id: "product", label: "Product Grid Hero", layoutId: 3 },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBannerOption(b.id as any);
                        setFormData({
                          ...formData,
                          banner: {
                            ...formData.banner,
                            layout: b.layoutId,
                          },
                        });
                      }}
                      className={cn(
                        "p-3.5 rounded-xl border-2 font-bold text-xs cursor-pointer text-center transition-all",
                        bannerOption === b.id
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Hero Headline / Slogan
                    </Label>
                    <Input
                      value={formData.banner?.slogan || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          banner: {
                            ...formData.banner,
                            slogan: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Hero Subtitle / Description
                    </Label>
                    <Input
                      value={formData.banner?.paragraph || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          banner: {
                            ...formData.banner,
                            paragraph: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                {bannerOption === "image" && (
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold text-gray-700">
                      Hero Background Images
                    </Label>
                    <ImageUpload
                      value={formData.banner?.bgImg || []}
                      onChange={(urls) =>
                        setFormData({
                          ...formData,
                          banner: {
                            ...formData.banner,
                            bgImg: Array.isArray(urls) ? urls : [urls],
                          },
                        })
                      }
                    />
                  </div>
                )}

                {bannerOption === "category" && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold text-gray-700">
                      Target Featured Category
                    </Label>
                    <Select
                      value={formData.banner?.categoryId || ""}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          banner: {
                            ...formData.banner,
                            categoryId: val,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white text-xs">
                        <SelectValue placeholder="Select Category for Hero" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories.map((c: any) => (
                          <SelectItem
                            key={c.id}
                            value={c.id}
                            className="cursor-pointer text-xs"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bannerOption === "product" && (
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold text-gray-700">
                      Featured Products in Hero
                    </Label>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-gray-50 border border-gray-200 items-center">
                      {(formData.banner?.productId || [])?.length === 0 ? (
                        <span className="text-xs text-gray-400 m-auto">
                          No products picked yet.
                        </span>
                      ) : (
                        (formData.banner?.productId || []).map(
                          (prodId: string) => {
                            const found = products.find(
                              (p: any) => p.id === prodId,
                            );
                            return (
                              <Badge
                                key={prodId}
                                variant="secondary"
                                className="px-3 py-1 bg-white border border-gray-200 text-xs font-bold gap-2"
                              >
                                <span>{found?.name || prodId}</span>
                                <button
                                  type="button"
                                  onClick={() => removeBannerProduct(prodId)}
                                  className="hover:text-red-500 font-bold"
                                >
                                  &times;
                                </button>
                              </Badge>
                            );
                          },
                        )
                      )}
                    </div>
                    <Select onValueChange={(val) => addBannerProduct(val)}>
                      <SelectTrigger className="h-11 rounded-xl bg-white text-xs">
                        <SelectValue placeholder="Add product to hero..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64">
                        {products.map((p: any) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="text-xs"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Shop by Category Blocks"
              description="Category showcase carousels and grid blocks"
              isOpen={expandedSections["home-category"]}
              onToggle={() => toggleSection("home-category")}
            >
              <div className="space-y-4">
                {(formData.shopByCategoryOrSubcategory || []).map(
                  (block: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">
                          Category Grid Block #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategoryShowcaseBlock(idx)}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                        >
                          <Trash2 size={14} className="mr-1" /> Remove Block
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700">
                          Block Layout
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {CATEGORY_BLOCK_LAYOUTS.map((layout) => (
                            <button
                              key={layout.id}
                              type="button"
                              onClick={() => {
                                const updated = [
                                  ...(formData.shopByCategoryOrSubcategory ||
                                    []),
                                ];
                                updated[idx] = {
                                  ...updated[idx],
                                  layout: layout.id,
                                };
                                setFormData({
                                  ...formData,
                                  shopByCategoryOrSubcategory: updated,
                                });
                              }}
                              className={cn(
                                "p-2.5 rounded-xl border-2 text-xs font-bold transition-colors cursor-pointer",
                                (block.layout || 1) === layout.id
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                              )}
                            >
                              {layout.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700">
                          Selected Categories (Up to 4)
                        </Label>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-gray-50 border border-gray-200 items-center">
                          {(block.catOrsubCatIds || [])?.length === 0 ? (
                            <span className="text-xs text-gray-400 m-auto">
                              No categories added to this block.
                            </span>
                          ) : (
                            (block.catOrsubCatIds || []).map((cId: string) => {
                              const found = categories.find(
                                (c: any) => c.id === cId,
                              );
                              return (
                                <Badge
                                  key={cId}
                                  variant="secondary"
                                  className="px-3 py-1 bg-white border border-gray-200 text-xs font-bold gap-2"
                                >
                                  <span>{found?.name || cId}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeCategoryFromShowcaseBlock(idx, cId)
                                    }
                                    className="hover:text-red-500 font-bold"
                                  >
                                    &times;
                                  </button>
                                </Badge>
                              );
                            })
                          )}
                        </div>

                        <Select
                          disabled={(block.catOrsubCatIds || [])?.length >= 4}
                          onValueChange={(val) =>
                            addCategoryToShowcaseBlock(idx, val)
                          }
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-white text-xs">
                            <SelectValue placeholder="Add category to this block..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl max-h-64">
                            {categories.map((c: any) => (
                              <SelectItem
                                key={c.id}
                                value={c.id}
                                disabled={(block.catOrsubCatIds || []).includes(
                                  c.id,
                                )}
                                className="text-xs"
                              >
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ),
                )}

                <Button
                  type="button"
                  onClick={addCategoryShowcaseBlock}
                  variant="outline"
                  className="w-full h-11 border-dashed rounded-xl text-xs font-bold"
                >
                  <Plus size={14} className="mr-1.5" /> Add Category Block
                </Button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Product Showcase Rows"
              description="Display products filtered by presets or categories"
              isOpen={expandedSections["home-products"]}
              onToggle={() => toggleSection("home-products")}
            >
              <div className="space-y-4">
                {(formData.productBy || []).map((row: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        Product Row #{idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductBySection(idx)}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                      >
                        <Trash2 size={14} className="mr-1" /> Remove
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700">
                        Row Layout
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {PRODUCT_SHOWCASE_LAYOUTS.map((layout) => (
                          <button
                            key={layout.id}
                            type="button"
                            onClick={() => {
                              const updated = [...(formData.productBy || [])];
                              updated[idx] = {
                                ...updated[idx],
                                layout: layout.id,
                              };
                              setFormData({
                                ...formData,
                                productBy: updated,
                              });
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border-2 text-xs font-bold transition-colors cursor-pointer",
                              (row.layout || 1) === layout.id
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                            )}
                          >
                            {layout.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700">
                          Source / Collection Title
                        </Label>
                        <Select
                          value={row.catOrSubcatOrmenu || "Featured Collection"}
                          onValueChange={(val) => {
                            const updated = [...(formData.productBy || [])];
                            updated[idx].catOrSubcatOrmenu = val;
                            setFormData({ ...formData, productBy: updated });
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-white text-xs">
                            <SelectValue placeholder="Select Source" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl max-h-64">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-bold text-blue-600 uppercase">
                                Preset Collections
                              </SelectLabel>
                              {PRESET_COLLECTIONS.map((col) => (
                                <SelectItem
                                  key={col}
                                  value={col}
                                  className="text-xs"
                                >
                                  {col}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup className="mt-2 pt-2 border-t">
                              <SelectLabel className="text-[10px] font-bold text-gray-500 uppercase">
                                Store Categories
                              </SelectLabel>
                              {categories.map((c: any) => (
                                <SelectItem
                                  key={c.id}
                                  value={c.name}
                                  className="text-xs"
                                >
                                  Category: {c.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700">
                          Max Products Displayed
                        </Label>
                        <Input
                          type="number"
                          min={2}
                          max={24}
                          value={row.max || 8}
                          onChange={(e) => {
                            const updated = [...(formData.productBy || [])];
                            updated[idx].max = Number(e.target.value);
                            setFormData({ ...formData, productBy: updated });
                          }}
                          className="h-10 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addProductBySection}
                  variant="outline"
                  className="w-full h-11 border-dashed rounded-xl text-xs font-bold"
                >
                  <Plus size={14} className="mr-1.5" /> Add Product Showcase Row
                </Button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Promotional Flash Sale Strip"
              description="Headline banners for ongoing discounts and promotional coupon codes"
              isOpen={expandedSections["home-sale"]}
              onToggle={() => toggleSection("home-sale")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Badge / Tagline
                  </Label>
                  <Input
                    value={formData.sale?.name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sale: { ...formData.sale, name: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Sale Title
                  </Label>
                  <Input
                    value={formData.sale?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sale: { ...formData.sale, title: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Coupon Code
                  </Label>
                  <Input
                    value={formData.sale?.coupon || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sale: { ...formData.sale, coupon: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Button Destination Link
                  </Label>
                  <Input
                    value={formData.sale?.link || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sale: { ...formData.sale, link: e.target.value },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case "showcase":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="New Arrivals Page Banner"
              description="Header banner background and typography for /new-arrivals"
              isOpen={expandedSections["showcase-new"]}
              onToggle={() => toggleSection("showcase-new")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Page Title
                    </Label>
                    <Input
                      value={formData.newPage?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPage: {
                            ...formData.newPage,
                            title: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Page Subtitle / Slogan
                    </Label>
                    <Input
                      value={formData.newPage?.slogan || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPage: {
                            ...formData.newPage,
                            slogan: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Header Background Image
                  </Label>
                  <ImageUpload
                    value={formData.newPage?.bgImg || ""}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        newPage: { ...formData.newPage, bgImg: url },
                      })
                    }
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Featured Collection Page Banner"
              description="Header banner settings for /featured"
              isOpen={expandedSections["showcase-featured"]}
              onToggle={() => toggleSection("showcase-featured")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Page Title
                    </Label>
                    <Input
                      value={formData.featuredPage?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuredPage: {
                            ...formData.featuredPage,
                            title: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Page Subtitle / Slogan
                    </Label>
                    <Input
                      value={formData.featuredPage?.slogan || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuredPage: {
                            ...formData.featuredPage,
                            slogan: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Header Background Image
                  </Label>
                  <ImageUpload
                    value={formData.featuredPage?.bgImg || ""}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        featuredPage: { ...formData.featuredPage, bgImg: url },
                      })
                    }
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Best Sellers Page Banner"
              description="Header banner settings for /best-sellers"
              isOpen={expandedSections["showcase-best"]}
              onToggle={() => toggleSection("showcase-best")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Page Title
                    </Label>
                    <Input
                      value={formData.bestPage?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bestPage: {
                            ...formData.bestPage,
                            title: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Page Subtitle / Slogan
                    </Label>
                    <Input
                      value={formData.bestPage?.slogan || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bestPage: {
                            ...formData.bestPage,
                            slogan: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">
                    Header Background Image
                  </Label>
                  <ImageUpload
                    value={formData.bestPage?.bgImg || ""}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        bestPage: { ...formData.bestPage, bgImg: url },
                      })
                    }
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case "about":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Story Header & Mission"
              description="Main headline and mission text on /about"
              isOpen={expandedSections["about-story"]}
              onToggle={() => toggleSection("about-story")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Badge Text
                    </Label>
                    <Input
                      value={formData.aboutPage?.badge || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aboutPage: {
                            ...formData.aboutPage,
                            badge: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Headline Prefix
                    </Label>
                    <Input
                      value={formData.aboutPage?.heading || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aboutPage: {
                            ...formData.aboutPage,
                            heading: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Headline Highlight
                    </Label>
                    <Input
                      value={formData.aboutPage?.highlightText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aboutPage: {
                            ...formData.aboutPage,
                            highlightText: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700">
                    Intro Paragraph
                  </Label>
                  <Textarea
                    rows={2}
                    value={formData.aboutPage?.intro || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aboutPage: {
                          ...formData.aboutPage,
                          intro: e.target.value,
                        },
                      })
                    }
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Key Stats Counters"
              description="Impact metrics displayed on the about page"
              isOpen={expandedSections["about-stats"]}
              onToggle={() => toggleSection("about-stats")}
            >
              <div className="space-y-3">
                {(formData.aboutPage?.stats || []).map(
                  (stat: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white"
                    >
                      <Input
                        placeholder="Label"
                        value={stat.label || ""}
                        onChange={(e) => {
                          const updated = [
                            ...(formData.aboutPage?.stats || []),
                          ];
                          updated[idx].label = e.target.value;
                          setFormData({
                            ...formData,
                            aboutPage: {
                              ...formData.aboutPage,
                              stats: updated,
                            },
                          });
                        }}
                        className="rounded-lg text-xs"
                      />
                      <Input
                        placeholder="Value (e.g. 120K+)"
                        value={stat.value || ""}
                        onChange={(e) => {
                          const updated = [
                            ...(formData.aboutPage?.stats || []),
                          ];
                          updated[idx].value = e.target.value;
                          setFormData({
                            ...formData,
                            aboutPage: {
                              ...formData.aboutPage,
                              stats: updated,
                            },
                          });
                        }}
                        className="rounded-lg text-xs font-bold max-w-[140px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAboutStat(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ),
                )}
                <Button
                  type="button"
                  onClick={addAboutStat}
                  variant="outline"
                  className="w-full h-10 border-dashed rounded-xl text-xs font-bold"
                >
                  <Plus size={14} className="mr-1.5" /> Add Stat Metric
                </Button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Core Brand Values"
              description="Four pillars that represent your brand philosophy"
              isOpen={expandedSections["about-values"]}
              onToggle={() => toggleSection("about-values")}
            >
              <div className="space-y-3">
                {(formData.aboutPage?.values || []).map(
                  (val: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder="Value Title"
                          value={val.title || ""}
                          onChange={(e) => {
                            const updated = [
                              ...(formData.aboutPage?.values || []),
                            ];
                            updated[idx].title = e.target.value;
                            setFormData({
                              ...formData,
                              aboutPage: {
                                ...formData.aboutPage,
                                values: updated,
                              },
                            });
                          }}
                          className="font-bold text-xs rounded-lg max-w-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAboutValue(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Description of this value..."
                        rows={2}
                        value={val.description || ""}
                        onChange={(e) => {
                          const updated = [
                            ...(formData.aboutPage?.values || []),
                          ];
                          updated[idx].description = e.target.value;
                          setFormData({
                            ...formData,
                            aboutPage: {
                              ...formData.aboutPage,
                              values: updated,
                            },
                          });
                        }}
                        className="rounded-lg text-xs"
                      />
                    </div>
                  ),
                )}
                <Button
                  type="button"
                  onClick={addAboutValue}
                  variant="outline"
                  className="w-full h-10 border-dashed rounded-xl text-xs font-bold"
                >
                  <Plus size={14} className="mr-1.5" /> Add Value Pillar
                </Button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Company Timeline & Milestones"
              description="Historical milestones displayed in a progression list"
              isOpen={expandedSections["about-timeline"]}
              onToggle={() => toggleSection("about-timeline")}
            >
              <div className="space-y-3">
                {(formData.aboutPage?.timeline || []).map(
                  (tl: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          placeholder="Year (e.g. 2024)"
                          value={tl.year || ""}
                          onChange={(e) => {
                            const updated = [
                              ...(formData.aboutPage?.timeline || []),
                            ];
                            updated[idx].year = e.target.value;
                            setFormData({
                              ...formData,
                              aboutPage: {
                                ...formData.aboutPage,
                                timeline: updated,
                              },
                            });
                          }}
                          className="font-bold text-xs rounded-lg max-w-[120px]"
                        />
                        <Input
                          placeholder="Milestone Title"
                          value={tl.title || ""}
                          onChange={(e) => {
                            const updated = [
                              ...(formData.aboutPage?.timeline || []),
                            ];
                            updated[idx].title = e.target.value;
                            setFormData({
                              ...formData,
                              aboutPage: {
                                ...formData.aboutPage,
                                timeline: updated,
                              },
                            });
                          }}
                          className="font-bold text-xs rounded-lg flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAboutTimeline(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Description of what happened..."
                        rows={2}
                        value={tl.description || ""}
                        onChange={(e) => {
                          const updated = [
                            ...(formData.aboutPage?.timeline || []),
                          ];
                          updated[idx].description = e.target.value;
                          setFormData({
                            ...formData,
                            aboutPage: {
                              ...formData.aboutPage,
                              timeline: updated,
                            },
                          });
                        }}
                        className="rounded-lg text-xs"
                      />
                    </div>
                  ),
                )}
                <Button
                  type="button"
                  onClick={addAboutTimeline}
                  variant="outline"
                  className="w-full h-10 border-dashed rounded-xl text-xs font-bold"
                >
                  <Plus size={14} className="mr-1.5" /> Add Timeline Milestone
                </Button>
              </div>
            </CollapsibleSection>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Contact Page Details"
              description="Header copy and contact labels for /contact"
              isOpen={expandedSections["contact-main"]}
              onToggle={() => toggleSection("contact-main")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Title
                    </Label>
                    <Input
                      value={formData.contact?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            title: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Subtitle Description
                    </Label>
                    <Input
                      value={formData.contact?.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            description: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Email Address / Label
                    </Label>
                    <Input
                      value={formData.contact?.mail || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            mail: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Phone Number / Support Line
                    </Label>
                    <Input
                      value={formData.contact?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Physical Address / Studio
                    </Label>
                    <Input
                      value={formData.contact?.address || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact,
                            address: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case "footer":
        return (
          <div className="space-y-4">
            <CollapsibleSection
              title="Footer Layout & Copyright"
              description="Footer structure style, copyright statement, and quick contact text"
              isOpen={expandedSections["footer-main"]}
              onToggle={() => toggleSection("footer-main")}
            >
              <div className="space-y-5">
                <div>
                  <Label className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2.5 block">
                    Footer Layout Style
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 1, name: "Layout 1: 4-Column Mega Footer" },
                      { id: 2, name: "Layout 2: Minimalist Centered Bar" },
                    ].map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            footer: {
                              ...formData.footer,
                              layout: variant.id,
                            },
                          });
                        }}
                        className={cn(
                          "p-3.5 rounded-xl border-2 font-bold text-xs cursor-pointer text-center transition-all",
                          (formData.footer?.layout || 1) === variant.id
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                        )}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Copyright Notice
                    </Label>
                    <Input
                      value={formData.footer?.copyright || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: {
                            ...formData.footer,
                            copyright: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Footer Contact Summary
                    </Label>
                    <Input
                      value={formData.footer?.contactInfo || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: {
                            ...formData.footer,
                            contactInfo: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50 space-y-3">
              <h4 className="font-bold text-sm text-red-900">
                Reset Theme Settings
              </h4>
              <p className="text-xs text-red-700 leading-relaxed">
                Restore all theme layout properties, branding, colors, and
                typography settings to factory defaults.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-xl font-bold text-xs h-10 px-4"
                  >
                    <RotateCcw size={14} className="mr-1.5" /> Reset Theme to
                    Default
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Reset entire theme configuration?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will overwrite your visual layout configurations with
                      original Lumina preset settings.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                    >
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="h-10 w-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-gray-900">
                  Theme & Visual Customizer
                </h1>
                <Badge
                  variant="outline"
                  className="bg-gray-50 border-gray-300 text-gray-600 font-mono text-[10px] uppercase font-bold"
                >
                  Live Engine
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                Design storefront layout configurations and navigation links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in">
                <Check size={16} /> Changes saved successfully!
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={updateThemeMutation.isPending}
              className="h-10 px-5 rounded-xl font-bold text-xs bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
            >
              {updateThemeMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />{" "}
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} className="mr-1.5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-1">
            <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs space-y-1 sticky top-24">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer text-left",
                      isActive
                        ? "bg-gray-900 text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-white" : "text-gray-400"}
                    />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">{renderSectionContent()}</div>
        </div>
      </div>
    </div>
  );
}
