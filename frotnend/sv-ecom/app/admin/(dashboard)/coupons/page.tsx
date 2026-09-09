"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  couponSchema,
  type CouponFormInput,
  type CouponFormValues,
} from "@/lib/validators";
import {
  Download,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Ticket,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/hooks/useAdminCoupons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useThemeStore } from "@/store/useThemeStore";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

type CouponScope = "ALL" | "PRODUCTS" | "CATEGORIES";

interface ProductReference {
  id: string;
  name: string;
  sku?: string | null;
}

interface CategoryReference {
  id: string;
  name: string;
}

interface RawCouponRelation {
  productId?: string;
  categoryId?: string;
}

interface RawCouponItem {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  scope: CouponScope;
  usageLimit?: number | null;
  usedCount?: number;
  perUserLimit?: number | null;
  startsAt?: string | null;
  expiresAt: string;
  isActive: boolean;
  products?: RawCouponRelation[];
  categories?: RawCouponRelation[];
}

interface CouponTableItem {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  scope: CouponScope;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startsAt: string | null;
  expiresAt: string;
  isActive: boolean;
}

const AdminCouponsPage = () => {
  const { primaryColor } = useThemeStore();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const [selectedCoupon, setSelectedCoupon] = useState<CouponTableItem | null>(
    null,
  );

  const dynamicStyles = {
    "--primary": primaryColor,
  } as CSSProperties;

  const { data: couponsResponse, isLoading: isFetchingCoupons } =
    useAdminCoupons(currentPage, pageSize);

  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();

  const { data: productsResponse, isLoading: isFetchingProducts } = useProducts(
    {
      page: 1,
      limit: 100,
    },
  );

  const { data: categoriesResponse, isLoading: isFetchingCategories } =
    useCategories(1, 100);

  const products: ProductReference[] = useMemo(() => {
    const data = productsResponse?.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  }, [productsResponse]);

  const categories: CategoryReference[] = useMemo(() => {
    const data = categoriesResponse?.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.categories)) return data.categories;
    if (Array.isArray(data)) return data;
    return [];
  }, [categoriesResponse]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: undefined,
      startsAt: undefined,
      expiresAt: new Date().toISOString() as unknown as Date,
      usageLimit: undefined,
      perUserLimit: undefined,
      scope: "ALL",
      productIds: [],
      categoryIds: [],
      isActive: true,
    },
  });

  const selectedType = watch("discountType");
  const selectedScope = watch("scope");
  const selectedProductIds = watch("productIds") ?? [];
  const selectedCategoryIds = watch("categoryIds") ?? [];
  const isActive = watch("isActive");

  useEffect(() => {
    if (selectedType === "FIXED") {
      setValue("maxDiscount", undefined, { shouldValidate: true });
    }
  }, [selectedType, setValue]);

  useEffect(() => {
    if (selectedScope === "ALL") {
      setValue("productIds", [], { shouldValidate: true });
      setValue("categoryIds", [], { shouldValidate: true });
    } else if (selectedScope === "PRODUCTS") {
      setValue("categoryIds", [], { shouldValidate: true });
    } else if (selectedScope === "CATEGORIES") {
      setValue("productIds", [], { shouldValidate: true });
    }
  }, [selectedScope, setValue]);

  const rawCoupons: RawCouponItem[] = useMemo(() => {
    const data = couponsResponse?.data;
    if (Array.isArray(data?.coupons)) return data.coupons;
    return [];
  }, [couponsResponse]);

  useEffect(() => {
    if (!selectedCoupon || !isEditOpen) return;

    const coupon = rawCoupons.find(
      (item: RawCouponItem) => item.id === selectedCoupon.id,
    );

    if (!coupon) return;

    reset({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount ?? undefined,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt) : undefined,
      expiresAt: new Date(coupon.expiresAt),
      usageLimit: coupon.usageLimit ?? undefined,
      perUserLimit: coupon.perUserLimit ?? undefined,
      scope: coupon.scope,
      productIds:
        coupon.products
          ?.map((item: RawCouponRelation) => item.productId || "")
          .filter(Boolean) ?? [],
      categoryIds:
        coupon.categories
          ?.map((item: RawCouponRelation) => item.categoryId || "")
          .filter(Boolean) ?? [],
      isActive: coupon.isActive,
    });
  }, [selectedCoupon, isEditOpen, reset, rawCoupons]);

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
  }, []);

  const handleStatusToggle = async (item: CouponTableItem) => {
    try {
      await updateCouponMutation.mutateAsync({
        id: item.id,
        payload: {
          isActive: !item.isActive,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const preparePayload = (values: CouponFormValues) => {
    return {
      ...values,
      code: values.code.trim().toUpperCase(),
      startsAt: values.startsAt
        ? new Date(values.startsAt).toISOString()
        : undefined,
      expiresAt: new Date(values.expiresAt).toISOString(),
      maxDiscount:
        values.discountType === "PERCENTAGE" ? values.maxDiscount : undefined,
      productIds: values.scope === "PRODUCTS" ? (values.productIds ?? []) : [],
      categoryIds:
        values.scope === "CATEGORIES" ? (values.categoryIds ?? []) : [],
    };
  };

  const onCreateSubmit = async (values: CouponFormValues) => {
    try {
      await createCouponMutation.mutateAsync(preparePayload(values));
      setIsCreateOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const onEditSubmit = async (values: CouponFormValues) => {
    if (!selectedCoupon) return;

    try {
      await updateCouponMutation.mutateAsync({
        id: selectedCoupon.id,
        payload: preparePayload(values),
      });

      setIsEditOpen(false);
      setSelectedCoupon(null);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCoupon) return;

    try {
      await deleteCouponMutation.mutateAsync(selectedCoupon.id);
      setIsDeleteOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleProduct = (productId: string) => {
    const current = selectedProductIds;
    if (current.includes(productId)) {
      setValue(
        "productIds",
        current.filter((id) => id !== productId),
        { shouldValidate: true },
      );
    } else {
      setValue("productIds", [...current, productId], { shouldValidate: true });
    }
  };

  const toggleCategory = (categoryId: string) => {
    const current = selectedCategoryIds;
    if (current.includes(categoryId)) {
      setValue(
        "categoryIds",
        current.filter((id) => id !== categoryId),
        { shouldValidate: true },
      );
    } else {
      setValue("categoryIds", [...current, categoryId], {
        shouldValidate: true,
      });
    }
  };

  const removeProduct = (productId: string) => {
    setValue(
      "productIds",
      selectedProductIds.filter((id) => id !== productId),
      { shouldValidate: true },
    );
  };

  const removeCategory = (categoryId: string) => {
    setValue(
      "categoryIds",
      selectedCategoryIds.filter((id) => id !== categoryId),
      { shouldValidate: true },
    );
  };

  const couponsData: CouponTableItem[] = useMemo(() => {
    return rawCoupons.map((coupon: RawCouponItem) => ({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount ?? null,
      scope: coupon.scope,
      usageLimit: coupon.usageLimit ?? null,
      usedCount: coupon.usedCount || 0,
      perUserLimit: coupon.perUserLimit ?? null,
      startsAt: coupon.startsAt ?? null,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
    }));
  }, [rawCoupons]);

  const filteredCoupons: CouponTableItem[] = useMemo(() => {
    let list = couponsData;

    if (statusFilter === "ACTIVE") {
      list = list.filter((c: CouponTableItem) => c.isActive);
    } else if (statusFilter === "DISABLED") {
      list = list.filter((c: CouponTableItem) => !c.isActive);
    } else if (statusFilter === "PERCENTAGE" || statusFilter === "FIXED") {
      list = list.filter(
        (c: CouponTableItem) => c.discountType === statusFilter,
      );
    }

    if (!searchTerm.trim()) return list;
    const q = searchTerm.trim().toLowerCase();

    return list.filter(
      (c: CouponTableItem) =>
        c.code.toLowerCase().includes(q) ||
        c.scope.toLowerCase().includes(q) ||
        c.discountType.toLowerCase().includes(q),
    );
  }, [couponsData, searchTerm, statusFilter]);

  const totalCoupons: number = useMemo(() => {
    const meta = couponsResponse?.data?.meta;
    if (typeof meta?.totalCoupons === "number") return meta.totalCoupons;
    return couponsData?.length;
  }, [couponsResponse, couponsData]);

  const columns: ColumnDef<CouponTableItem>[] = [
    {
      accessorKey: "code",
      header: createSortableHeader("PROMO CODE"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[var(--primary)] rounded-lg">
            <Ticket size={16} />
          </div>

          <div>
            <span className="font-mono font-black text-gray-950 text-sm tracking-wider">
              {row.original.code}
            </span>

            <div className="mt-1">
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-black"
              >
                {row.original.scope}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "discountValue",
      header: createSortableHeader("DISCOUNT"),
      cell: ({ row }) => (
        <span className="font-black text-gray-900 font-mono">
          {row.original.discountType === "PERCENTAGE"
            ? `${row.original.discountValue}% Off`
            : `৳${row.original.discountValue.toLocaleString()} Off`}
        </span>
      ),
    },
    {
      accessorKey: "minOrderValue",
      header: createSortableHeader("MIN PURCHASE"),
      cell: ({ row }) => (
        <span className="font-semibold text-gray-500 font-mono text-xs">
          ৳{row.original.minOrderValue.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "usageLimit",
      header: createSortableHeader("USAGE"),
      cell: ({ row }) => {
        const limit = row.original.usageLimit;
        return (
          <div className="text-xs font-mono">
            <span className="font-bold text-gray-900">
              {row.original.usedCount}
            </span>
            <span className="text-gray-400"> / {limit ?? "∞"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "expiresAt",
      header: createSortableHeader("EXPIRATION"),
      cell: ({ row }) => (
        <div className="text-xs font-mono">
          {row.original.startsAt && (
            <div className="text-gray-400 text-[10px]">
              Starts{" "}
              {new Date(row.original.startsAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          )}

          <span className="text-gray-600 font-medium">
            {new Date(row.original.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: createSortableHeader("STATUS"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={row.original.isActive}
            onCheckedChange={() => handleStatusToggle(row.original)}
            className="data-[state=checked]:bg-[var(--primary)] scale-90"
          />

          <Badge
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
              row.original.isActive
                ? "bg-green-50 text-green-600 border-green-100"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}
          >
            {row.original.isActive ? "Active" : "Disabled"}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 cursor-pointer"
            >
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem
              className="font-bold text-sm cursor-pointer"
              onClick={() => {
                setSelectedCoupon(row.original);
                setIsEditOpen(true);
              }}
            >
              Edit Promo
            </DropdownMenuItem>

            <DropdownMenuItem
              className="font-bold text-sm text-red-500 cursor-pointer"
              onClick={() => {
                setSelectedCoupon(row.original);
                setIsDeleteOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const renderScopeSelector = () => (
    <div className="space-y-2">
      <Label className="font-bold text-gray-700">Coupon Scope</Label>

      <Controller
        control={control}
        name="scope"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="h-12 rounded-xl border-gray-200 font-bold text-sm">
              <SelectValue placeholder="Select coupon scope" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="rounded-lg">
                All Products
              </SelectItem>
              <SelectItem value="PRODUCTS" className="rounded-lg">
                Specific Products
              </SelectItem>
              <SelectItem value="CATEGORIES" className="rounded-lg">
                Specific Categories
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      {errors.scope && (
        <p className="text-xs font-bold text-red-500">{errors.scope.message}</p>
      )}
    </div>
  );

  const renderProductSelector = () => {
    if (selectedScope !== "PRODUCTS") return null;

    return (
      <div className="space-y-3">
        <Label className="font-bold text-gray-700">Select Products</Label>

        {selectedProductIds?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedProductIds.map((id: string) => {
              const product = products.find(
                (item: ProductReference) => item.id === id,
              );
              return (
                <Badge
                  key={id}
                  className="rounded-lg px-3 py-1.5 bg-[var(--primary)] text-white gap-2"
                >
                  {product?.name ?? id}
                  <button
                    type="button"
                    onClick={() => removeProduct(id)}
                    className="hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        <div className="border border-gray-200 rounded-xl max-h-52 overflow-y-auto p-2">
          {isFetchingProducts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-gray-400" />
            </div>
          ) : products?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No products found
            </p>
          ) : (
            products.map((product: ProductReference) => (
              <label
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedProductIds.includes(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">
                    {product.name}
                  </p>
                  {product.sku && (
                    <p className="text-[10px] text-gray-400 font-mono">
                      {product.sku}
                    </p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        {errors.productIds && (
          <p className="text-xs font-bold text-red-500">
            {errors.productIds.message}
          </p>
        )}
      </div>
    );
  };

  const renderCategorySelector = () => {
    if (selectedScope !== "CATEGORIES") return null;

    return (
      <div className="space-y-3">
        <Label className="font-bold text-gray-700">Select Categories</Label>

        {selectedCategoryIds?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategoryIds.map((id: string) => {
              const category = categories.find(
                (item: CategoryReference) => item.id === id,
              );
              return (
                <Badge
                  key={id}
                  className="rounded-lg px-3 py-1.5 bg-[var(--primary)] text-white gap-2"
                >
                  {category?.name ?? id}
                  <button
                    type="button"
                    onClick={() => removeCategory(id)}
                    className="hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        <div className="border border-gray-200 rounded-xl max-h-52 overflow-y-auto p-2">
          {isFetchingCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="animate-spin text-gray-400" />
            </div>
          ) : categories?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No categories found
            </p>
          ) : (
            categories.map((category: CategoryReference) => (
              <label
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategoryIds.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <span className="font-bold text-sm text-gray-800">
                  {category.name}
                </span>
              </label>
            ))
          )}
        </div>

        {errors.categoryIds && (
          <p className="text-xs font-bold text-red-500">
            {errors.categoryIds.message}
          </p>
        )}
      </div>
    );
  };

  const renderCouponForm = (mode: "create" | "edit") => (
    <form
      onSubmit={handleSubmit(mode === "create" ? onCreateSubmit : onEditSubmit)}
      className="space-y-5 py-2"
    >
      <div className="space-y-2">
        <Label htmlFor={`${mode}-code`} className="font-bold text-gray-700">
          Promo Code
        </Label>
        <Input
          id={`${mode}-code`}
          placeholder="e.g. SUMMER50"
          className="h-12 rounded-xl border-gray-200 uppercase font-mono font-black tracking-wider"
          {...register("code")}
        />
        {errors.code && (
          <p className="text-xs font-bold text-red-500">
            {errors.code.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-bold text-gray-700">Type</Label>
          <Controller
            control={control}
            name="discountType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 font-bold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="PERCENTAGE" className="rounded-lg">
                    Percentage (%)
                  </SelectItem>
                  <SelectItem value="FIXED" className="rounded-lg">
                    Fixed (৳)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`${mode}-discountValue`}
            className="font-bold text-gray-700"
          >
            Discount Value
          </Label>
          <Input
            id={`${mode}-discountValue`}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 15"
            className="h-12 rounded-xl border-gray-200 font-mono"
            {...register("discountValue")}
          />
          {errors.discountValue && (
            <p className="text-xs font-bold text-red-500">
              {errors.discountValue.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={`${mode}-minOrderValue`}
            className="font-bold text-gray-700"
          >
            Min Order Value
          </Label>
          <Input
            id={`${mode}-minOrderValue`}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 100"
            className="h-12 rounded-xl border-gray-200 font-mono"
            {...register("minOrderValue")}
          />
          {errors.minOrderValue && (
            <p className="text-xs font-bold text-red-500">
              {errors.minOrderValue.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`${mode}-maxDiscount`}
            className="font-bold text-gray-700"
          >
            Max Discount (৳)
          </Label>
          <Input
            id={`${mode}-maxDiscount`}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 50"
            disabled={selectedType === "FIXED"}
            className="h-12 rounded-xl border-gray-200 disabled:opacity-50 font-mono"
            {...register("maxDiscount")}
          />
          {errors.maxDiscount && (
            <p className="text-xs font-bold text-red-500">
              {errors.maxDiscount.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={`${mode}-startsAt`}
            className="font-bold text-gray-700"
          >
            Start Date (Optional)
          </Label>
          <Input
            id={`${mode}-startsAt`}
            type="date"
            className="h-12 rounded-xl border-gray-200 font-mono"
            {...register("startsAt")}
          />
          {errors.startsAt && (
            <p className="text-xs font-bold text-red-500">
              {errors.startsAt.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`${mode}-expiresAt`}
            className="font-bold text-gray-700"
          >
            Expiration Date *
          </Label>
          <Input
            id={`${mode}-expiresAt`}
            type="date"
            className="h-12 rounded-xl border-gray-200 font-mono"
            {...register("expiresAt")}
          />
          {errors.expiresAt && (
            <p className="text-xs font-bold text-red-500">
              {errors.expiresAt.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={`${mode}-usageLimit`}
            className="font-bold text-gray-700"
          >
            Usage Limit
          </Label>
          <Input
            id={`${mode}-usageLimit`}
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            className="h-12 rounded-xl border-gray-200 font-mono"
            {...register("usageLimit")}
          />
          {errors.usageLimit && (
            <p className="text-xs font-bold text-red-500">
              {errors.usageLimit.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`${mode}-perUserLimit`}
            className="font-bold text-gray-700"
          >
            Per User Limit
          </Label>
          <Input
            id={`${mode}-perUserLimit`}
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            className="h-12 rounded-xl border-gray-200 font-mono"
            {...register("perUserLimit")}
          />
          {errors.perUserLimit && (
            <p className="text-xs font-bold text-red-500">
              {errors.perUserLimit.message}
            </p>
          )}
        </div>
      </div>

      {renderScopeSelector()}
      {renderProductSelector()}
      {renderCategorySelector()}

      <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
        <div>
          <p className="font-bold text-gray-800 text-sm">Coupon Status</p>
          <p className="text-xs text-gray-400 mt-1">
            Enable this coupon for checkout
          </p>
        </div>

        <Switch
          checked={isActive}
          onCheckedChange={(value) =>
            setValue("isActive", value, { shouldValidate: true })
          }
          className="data-[state=checked]:bg-[var(--primary)]"
        />
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="submit"
          disabled={
            mode === "create"
              ? createCouponMutation.isPending
              : updateCouponMutation.isPending
          }
          className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
        >
          {mode === "create" ? (
            createCouponMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Creating...
              </>
            ) : (
              "Create Promo"
            )
          ) : updateCouponMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div
      style={dynamicStyles}
      className="space-y-8 animate-in fade-in duration-700"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Coupons
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Create and manage store discount campaigns
          </p>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(value: boolean) => {
            setIsCreateOpen(value);
            if (!value) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer">
              <Plus size={18} className="mr-2" />
              Add Promo
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[620px] rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                Create Promo Code
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                Configure a new store discount campaign
              </DialogDescription>
            </DialogHeader>

            {renderCouponForm("create")}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search promo code or scope..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10 pr-9 h-11 rounded-xl text-xs bg-gray-50 border-gray-200"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Promos" },
            { id: "ACTIVE", label: "Active" },
            { id: "DISABLED", label: "Disabled" },
            { id: "PERCENTAGE", label: "% Percentage" },
            { id: "FIXED", label: "৳ Fixed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                statusFilter === tab.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={isEditOpen}
        onOpenChange={(value: boolean) => {
          setIsEditOpen(value);
          if (!value) {
            setSelectedCoupon(null);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[620px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Edit Promo Code
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Update parameters of selected discount
            </DialogDescription>
          </DialogHeader>

          {renderCouponForm("edit")}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
              This action cannot be undone. This will permanently delete the
              promo code from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedCoupon(null)}
              className="rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteCouponMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6 cursor-pointer"
            >
              {deleteCouponMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable
        columns={columns}
        data={filteredCoupons}
        totalCount={filteredCoupons?.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetchingCoupons}
        title="Promo Codes"
        className="rounded-[2.5rem] border-none shadow-none bg-transparent"
      />
    </div>
  );
};

export default AdminCouponsPage;
