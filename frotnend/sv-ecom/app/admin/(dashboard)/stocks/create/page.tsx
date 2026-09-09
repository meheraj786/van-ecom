"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Boxes,
  ChevronsUpDown,
  Check,
  AlertCircle,
  Plus,
  ArrowLeft,
} from "lucide-react";
import {
  addBatchSchema,
  type AddBatchFormInput,
  type AddBatchFormValues,
} from "@/lib/validators";
import { useAddBatch, useVariantStockSummary } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useThemeStore } from "@/store/useThemeStore";

export default function CreateBatchPage() {
  const router = useRouter();
  const { primaryColor } = useThemeStore();

  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>("");
  const [productSearchOpen, setProductSearchOpen] = React.useState(false);

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
  });

  const { data: stockSummary, isLoading: summaryLoading } =
    useVariantStockSummary(selectedVariantId);

  const addBatchMutation = useAddBatch();

  const products = productsData?.data?.items || [];
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const availableVariants = selectedProduct?.variants || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddBatchFormInput, unknown, AddBatchFormValues>({
    resolver: zodResolver(addBatchSchema),
    defaultValues: {
      variantId: "",
      batchNumber: "",
      purchasePrice: 0,
      sellingPrice: 0,
      quantityReceived: 1,
      isDiscounted: false,
      beforeDiscount: undefined,
      note: "",
    },
  });

  const isDiscountedWatch = watch("isDiscounted");

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedVariantId("");
    setValue("variantId", "", { shouldValidate: true });
    setProductSearchOpen(false);
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setValue("variantId", variantId, { shouldValidate: true });
  };

  const generateAutoBatchNumber = () => {
    const code = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    setValue("batchNumber", code);
  };

  const onSubmit = async (values: AddBatchFormValues) => {
    await addBatchMutation.mutateAsync({
      variantId: values.variantId,
      batchNumber: values.batchNumber?.trim() || undefined,
      purchasePrice: Number(values.purchasePrice),
      sellingPrice: Number(values.sellingPrice),
      quantityReceived: Number(values.quantityReceived),
      isDiscounted: values.isDiscounted,
      beforeDiscount: values.isDiscounted
        ? Number(values.beforeDiscount)
        : undefined,
      note: values.note?.trim() || undefined,
    });

    router.push("/admin/stocks");
  };

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="w-full max-w-[1200px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500"
    >
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl h-11 w-11"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
              Add Stock Batch
            </h1>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
              Supply new quantity under FIFO valuation
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="rounded-[2rem] border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold uppercase tracking-tight">
              1. Product & Variant Selection
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider text-gray-400">
              Select product first, then choose specific variant SKU
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-w-md space-y-2">
              <Label className="font-bold text-gray-700">Select Product</Label>
              <Popover
                open={productSearchOpen}
                onOpenChange={setProductSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productSearchOpen}
                    className="w-full h-12 rounded-xl justify-between font-normal"
                  >
                    {selectedProduct
                      ? selectedProduct.name
                      : "Search product..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search product name or SKU..." />
                    <CommandList>
                      <CommandEmpty>
                        {productsLoading ? "Loading..." : "No product found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {products.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={`${p.name} ${p.sku || ""}`}
                            onSelect={() => handleSelectProduct(p.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProductId === p.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-gray-900">
                                {p.name}
                              </span>
                              {p.sku && (
                                <span className="text-xs text-gray-400">
                                  SKU: {p.sku}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedProductId && (
              <div className="space-y-3 pt-2">
                <Label className="font-bold text-gray-700">
                  Select Variant ({availableVariants?.length})
                </Label>
                {availableVariants?.length === 0 ? (
                  <p className="text-xs text-gray-400 border p-4 rounded-xl border-dashed text-center">
                    No variants created for this product.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {availableVariants.map((v) => {
                      const isSelected = selectedVariantId === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectVariant(v.id)}
                          className={cn(
                            "border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3",
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]"
                              : "hover:border-gray-300 bg-white",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-gray-900">
                              {v.sku}
                            </span>
                            {isSelected && (
                              <Badge className="bg-[var(--primary)] text-white text-[10px]">
                                Selected
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {v.productVariantValues &&
                            v.productVariantValues?.length > 0 ? (
                              v.productVariantValues.map((pvv) => (
                                <Badge
                                  key={pvv.id}
                                  variant="secondary"
                                  className="text-[11px] font-medium"
                                >
                                  <span className="text-gray-400 mr-1">
                                    {pvv.optionValue.option.name}:
                                  </span>
                                  {pvv.optionValue.value}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">
                                Default Variant
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.variantId && (
                  <p className="text-xs font-bold text-red-500">
                    {errors.variantId.message}
                  </p>
                )}
              </div>
            )}

            {selectedVariantId && stockSummary && (
              <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    Available Stock
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    {summaryLoading ? "..." : stockSummary.totalStock} units
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    Current FIFO Sell Price
                  </span>
                  <span className="text-2xl font-black text-green-600 mt-1 block">
                    ৳{summaryLoading ? "..." : stockSummary.currentSellingPrice}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                    Active Batches
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    {summaryLoading ? "..." : stockSummary.activeBatchesCount}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedVariantId && (
          <Card className="rounded-[2rem] border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold uppercase tracking-tight">
                2. Batch Financials & Quantities
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider text-gray-400">
                Specify purchase cost, retail selling price, and received units
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="batchNumber"
                      className="font-bold text-gray-700"
                    >
                      Batch Code / Invoice
                    </Label>
                    <button
                      type="button"
                      onClick={generateAutoBatchNumber}
                      className="text-xs font-bold text-[var(--primary)] hover:underline"
                    >
                      Auto Generate
                    </button>
                  </div>
                  <Input
                    id="batchNumber"
                    placeholder="e.g., BATCH-20260824-001"
                    className="h-12 rounded-xl"
                    {...register("batchNumber")}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="quantityReceived"
                    className="font-bold text-gray-700"
                  >
                    Quantity Received *
                  </Label>
                  <Input
                    id="quantityReceived"
                    type="number"
                    min="1"
                    placeholder="50"
                    className="h-12 rounded-xl"
                    {...register("quantityReceived")}
                  />
                  {errors.quantityReceived && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.quantityReceived.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="purchasePrice"
                    className="font-bold text-gray-700"
                  >
                    Purchase / Cost Price (৳) *
                  </Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="800"
                    className="h-12 rounded-xl"
                    {...register("purchasePrice")}
                  />
                  {errors.purchasePrice && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.purchasePrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sellingPrice"
                    className="font-bold text-gray-700"
                  >
                    Selling Price (৳) *
                  </Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1200"
                    className="h-12 rounded-xl"
                    {...register("sellingPrice")}
                  />
                  {errors.sellingPrice && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.sellingPrice.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50 space-y-4">
                <Controller
                  control={control}
                  name="isDiscounted"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-bold text-gray-900 block">
                          Discounted Batch Promotion
                        </Label>
                        <p className="text-xs text-gray-400">
                          Show slashed original price on storefront
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />

                {isDiscountedWatch && (
                  <div className="pt-2 max-w-xs space-y-2">
                    <Label
                      htmlFor="beforeDiscount"
                      className="font-bold text-gray-700"
                    >
                      Original Price Before Discount (৳)
                    </Label>
                    <Input
                      id="beforeDiscount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1500"
                      className="h-12 rounded-xl bg-white"
                      {...register("beforeDiscount")}
                    />
                    {errors.beforeDiscount && (
                      <p className="text-xs font-bold text-red-500">
                        {errors.beforeDiscount.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="font-bold text-gray-700">
                  Batch Notes
                </Label>
                <Textarea
                  id="note"
                  rows={3}
                  placeholder="Optional supplier invoices or conditions..."
                  className="rounded-xl"
                  {...register("note")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-6 rounded-xl font-bold"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addBatchMutation.isPending}
                  className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                >
                  {addBatchMutation.isPending
                    ? "Creating..."
                    : "Save Stock Batch"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
