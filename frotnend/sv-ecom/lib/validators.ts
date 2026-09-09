import { z } from "zod";

const optionalPositiveNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
}, z.number().min(1, "Must be at least 1").optional());

const optionalPriceNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
}, z.number().min(0.01, "Must be greater than 0").optional());

const optionalDate = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const date = new Date(val as string);
  return Number.isNaN(date.getTime()) ? undefined : date;
}, z.date().optional());

export const loginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export const registerVendorSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase alphanumeric and hyphens only",
    ),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const subCategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase alphanumeric and hyphens only",
    ),
  categoryId: z.string().min(1, "Parent category is required"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const productOptionValueSchema = z.object({
  value: z.string().min(1, "Value is required"),
  metadata: z.record(z.any(), z.any()).optional(),
});

export const productOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  values: z
    .array(productOptionValueSchema)
    .min(1, "At least one option value is required"),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1, "Variant SKU is required"),
  images: z.array(z.string()).optional().default([]),
  optionValueIds: z.array(z.string()).optional().default([]),
  combinationValues: z.record(z.string(), z.string()).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase alphanumeric and hyphens only",
    ),
  sku: z.string().optional(),
  baseImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  subCategoryIds: z.array(z.string()).optional().default([]),
  isNew: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  options: z.array(productOptionSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
});

export const addBatchSchema = z.object({
  variantId: z.string().min(1, "Variant selection is required"),
  batchNumber: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, "Purchase price cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative"),
  quantityReceived: z.coerce.number().min(1, "Quantity must be at least 1"),
  isDiscounted: z.boolean().default(false),
  beforeDiscount: z.coerce.number().min(0).optional(),
  note: z.string().optional(),
});

export const divisionSchema = z.object({
  name: z.string().min(1, "Division name is required"),
  deliveryCharge: z.coerce
    .number()
    .min(0, "Delivery charge cannot be negative"),
});

export const couponSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(0.01, "Discount must be greater than 0"),
  minOrderValue: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  }, z.number().min(0).default(0)),
  maxDiscount: optionalPriceNumber,
  startsAt: optionalDate,
  expiresAt: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const date = new Date(val as string);
      return Number.isNaN(date.getTime()) ? undefined : date;
    },
    z.date({ message: "Valid expiration date is required" }),
  ),
  usageLimit: optionalPositiveNumber,
  perUserLimit: optionalPositiveNumber,
  scope: z.enum(["ALL", "PRODUCTS", "CATEGORIES"]).default("ALL"),
  productIds: z.array(z.string()).optional().default([]),
  categoryIds: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
});

export const crmCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Valid phone number is required"),
  address: z.string().min(3, "Shipping address is required"),
});

export const checkoutSchema = z.object({
  divisionId: z.string().min(1, "Please select a delivery division"),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["COD", "SSLCOMMERZ"]),
  billing: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(8, "Valid phone number is required"),
    address: z.string().min(5, "Full street address is required"),
    city: z.string().min(2, "City name is required"),
    zipCode: z.string().optional(),
    country: z.string(),
  }),
});

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+0-9\s-]{7,20}$/.test(val),
      "Please enter a valid phone number",
    ),
  subject: z.string().max(150, "Subject is too long").optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type DivisionFormValues = z.infer<typeof divisionSchema>;
export type DivisionFormInput = z.input<typeof divisionSchema>;
export type ProductOptionValueFormValues = z.infer<
  typeof productOptionValueSchema
>;
export type ProductOptionFormValues = z.infer<typeof productOptionSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type SubCategoryFormValues = z.infer<typeof subCategorySchema>;
export type AddBatchFormValues = z.infer<typeof addBatchSchema>;
export type AddBatchFormInput = z.input<typeof addBatchSchema>;
export type CouponFormValues = z.infer<typeof couponSchema>;
export type CouponFormInput = z.input<typeof couponSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type CustomerFormValues = z.infer<typeof crmCustomerSchema>;
