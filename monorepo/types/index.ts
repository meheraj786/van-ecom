export type Role = 'ADMIN' | 'STAFF' | 'USER';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'SSLCOMMERZ';

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED';

export type CouponScope = 'ALL' | 'PRODUCTS' | 'CATEGORIES';

export type ProductSortOption =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'rating-high'
  | 'rating-low';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  data: T[];
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Vendor {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'STAFF';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: Category;
  image?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string;
  metadata?: Record<string, unknown> | null;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  images: string[];
  optionValueIds?: string[];
  options?: Record<string, string>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  baseImage?: string | null;
  description?: string | null;
  categoryIds: string[];
  subCategoryIds: string[];
  categories?: Category[];
  subCategories?: SubCategory[];
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface StockBatch {
  id: string;
  variantId: string;
  batchNumber?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  quantityReceived: number;
  quantityRemaining: number;
  isDiscounted: boolean;
  beforeDiscount?: number | null;
  note?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface VariantStockSummary {
  variantId: string;
  totalStock: number;
  currentSellingPrice: number;
  currentPurchasePrice: number;
  activeBatchesCount: number;
}

export interface FifoBatchSelection {
  stockId: string;
  quantity: number;
  sellingPrice: number;
}

export interface FifoPriceCalculation {
  variantId: string;
  quantity: number;
  totalPrice: number;
  unitPriceAverage: number;
  isAvailable: boolean;
  availableStock: number;
  batches: FifoBatchSelection[];
}

export interface StockDeductItem {
  variantId: string;
  quantity: number;
}

export interface CartItem {
  userId?: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  sku?: string;
  options?: Record<string, string>;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  startsAt?: string | Date | null;
  expiresAt: string | Date;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit?: number | null;
  scope: CouponScope;
  isActive: boolean;
  productIds?: string[];
  categoryIds?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CouponValidationResult {
  code: string;
  discountAmount: number;
  discountType: CouponDiscountType;
}

export interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode?: string | null;
  country?: string;
}

export interface VariantSnapshot {
  productName: string;
  productSlug?: string;
  sku?: string;
  image?: string;
  options?: Record<string, string>;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  variantSnapshot: VariantSnapshot;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Division {
  id: string;
  name: string;
  deliveryCharge: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SSLCommerzPaymentDetails {
  status: string;
  tran_id: string;
  val_id?: string;
  amount: string;
  card_type?: string;
  card_brand?: string;
  card_issuer?: string;
  bank_tran_id?: string;
  tran_date?: string;
  currency?: string;
  risk_level?: string;
  risk_title?: string;
  [key: string]: unknown;
}

export interface Order {
  id: string;
  userId?: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  zipCode?: string | null;
  totalAmount: number | string;
  discountAmount: number;
  couponCode?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  paymentDetails?: SSLCommerzPaymentDetails | null;
  divisionId: string;
  division?: Division;
  items: OrderItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateOrderPayload {
  divisionId: string;
  customerId?: string;
  couponCode?: string;
  paymentMethod?: PaymentMethod;
  billing: BillingInfo;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
    sku?: string;
    slug?: string;
    options?: Record<string, string>;
  }[];
}

export interface CreateOrderResult {
  order: Order;
  gatewayUrl: string | null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

export interface Conversation {
  id: string;
  userA: string;
  userB: string;
  lastMessage?: string | null;
  lastMessageAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

export interface ThemeNavbar {
  layout?: number;
  menus?: string[];
}

export interface ThemeBanner {
  layout?: number;
  slogan?: string;
  paragraph?: string;
  bgImg?: string[];
  productId?: string[];
  categoryId?: string;
}

export interface ThemeSocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface ThemeSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

export interface ThemeSettings {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  navbar?: ThemeNavbar;
  banner?: ThemeBanner;
  socialLinks?: ThemeSocialLinks;
  seo?: ThemeSeo;
  footer?: {
    layout?: number;
    copyright?: string;
    contactInfo?: string;
  };
}