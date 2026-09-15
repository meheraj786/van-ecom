import { api } from "@/lib/api";

export interface NavbarConfig {
  layout: number;
  menus: string[];
}

export interface BannerConfig {
  layout: number;
  slogan: string;
  paragraph: string;
  bgImg?: string[];
  productId?: string[];
  categoryId?: string;
}

export interface CategorySectionConfig {
  layout: number;
  catOrsubCatIds: string[];
  max: number;
}

export interface ProductBySectionConfig {
  layout: number;
  catOrSubcatOrmenu: string;
  max: number;
}

export interface SaleBannerConfig {
  name: string;
  title: string;
  para: string;
  link: string;
  coupon: string;
  bgColor: string;
}

export interface ShowcasePageConfig {
  bgImg?: string;
  bgColor: string;
  title: string;
  slogan: string;
  badge?: string;
}

export interface FooterConfig {
  layout: number;
  copyright: string;
  contactInfo: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface ValueItem {
  icon: string;
  title: string;
  description: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface MissionConfig {
  title: string;
  body: string;
}

export interface QuoteConfig {
  text: string;
  author: string;
}

export interface CtaConfig {
  title: string;
  description: string;
  primaryBtn: string;
  secondaryBtn: string;
}

export interface AboutPageConfig {
  layout?: number;
  badge: string;
  heading: string;
  highlightText: string;
  headingSuffix: string;
  intro: string;
  mission: MissionConfig;
  stats: StatItem[];
  values: ValueItem[];
  timeline: TimelineItem[];
  quote: QuoteConfig;
  cta: CtaConfig;
}

export interface ContactConfig {
  title?: string;
  description?: string;
  mail?: string;
  phone?: string;
  address?: string;
}

export interface SocialLinksConfig {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface ThemeSeoConfig {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

export interface ChatConfig {
  whatsappNumber?: string;
  messengerUsername?: string;
  telegramUsername?: string;
  isWhatsappEnabled?: boolean;
  isMessengerEnabled?: boolean;
}

export interface ThemeConfig {
  id?: string;
  themeKey?: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  navbar: NavbarConfig;
  banner: BannerConfig;
  shopByCategoryOrSubcategory: CategorySectionConfig[];
  productBy: ProductBySectionConfig[];
  sale: SaleBannerConfig;
  newPage: ShowcasePageConfig;
  featuredPage: ShowcasePageConfig;
  bestPage: ShowcasePageConfig;
  footer: FooterConfig;
  aboutPage: AboutPageConfig;
  contact?: ContactConfig;
  socialLinks?: SocialLinksConfig;
  seo?: ThemeSeoConfig;
  chat?: ChatConfig;
}

export const themeService = {
  async getTheme(): Promise<ThemeConfig> {
    const res: any = await api.get("/theme");
    return res.data?.data || res.data;
  },

  async updateTheme(payload: Partial<ThemeConfig>): Promise<ThemeConfig> {
    const res: any = await api.put("/theme", payload);
    return res.data?.data || res.data;
  },

  async resetTheme(): Promise<ThemeConfig> {
    const res: any = await api.post("/theme/reset");
    return res.data?.data || res.data;
  },
};
