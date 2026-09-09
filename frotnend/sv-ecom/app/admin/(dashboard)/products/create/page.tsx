"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
  Sparkles,
  X,
  Layers,
  PlusCircle,
} from "lucide-react";
import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/validators";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSubCategories } from "@/hooks/useSubCategories";
import { ImageUpload } from "@/components/ui/image-upload";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const PRESET_OPTIONS = [
  "Color",
  "Size",
  "Storage",
  "RAM",
  "Shoe Size",
  "Material",
  "Fabric",
  "Weight",
  "Volume",
  "Flavor",
  "Scent / Fragrance",
  "Shade",
  "Fit",
  "Sleeve",
  "Neck Type",
  "Pattern",
  "Processor",
  "Screen Size",
  "Connectivity",
  "Package Type",
  "Material Purity",
  "Strap",
  "Dimensions",
  "Format",
  "Pack Quantity",
  "Condition",
  "Warranty",
];

export default function CreateProductPage() {
  const router = useRouter();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(
    1,
    100,
  );
  const { data: subCategoriesData, isLoading: subCategoriesLoading } =
    useSubCategories(1, 100);
  const createProductMutation = useCreateProduct();

  const [openCategoryDropdown, setOpenCategoryDropdown] = React.useState(false);
  const [openSubCategoryDropdown, setOpenSubCategoryDropdown] =
    React.useState(false);
  const [tagInputs, setTagInputs] = React.useState<Record<number, string>>({});
  const [openOptionDropdown, setOpenOptionDropdown] = React.useState<
    Record<number, boolean>
  >({});

  const [manualCombSelections, setManualCombSelections] = React.useState<
    Record<string, string>
  >({});
  const [manualSku, setManualSku] = React.useState("");
  const [manualImage, setManualImage] = React.useState("");
  const [manualError, setManualError] = React.useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      baseImage: "",
      description: "",
      categoryIds: [],
      subCategoryIds: [],
      isNew: true,
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
      options: [],
      variants: [],
    },
  });

  const selectedCategoryIds = watch("categoryIds") || [];
  const selectedSubCategoryIds = watch("subCategoryIds") || [];

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: "options",
  });

  const {
    fields: variantFields,
    append: appendVariant,
    replace: replaceVariants,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const categories: Array<{ id: string; name: string }> =
    categoriesData?.data?.items || categoriesData?.data?.categories || [];

  const allSubCategories: Array<{
    id: string;
    name: string;
    categoryId: string;
  }> =
    subCategoriesData?.data?.items ||
    subCategoriesData?.data?.subcategories ||
    [];

  const filteredSubCategories = React.useMemo(() => {
    if (!selectedCategoryIds?.length) return [];
    return allSubCategories.filter((sub) =>
      selectedCategoryIds.includes(sub.categoryId),
    );
  }, [allSubCategories, selectedCategoryIds]);

  const handleCategoryToggle = (catId: string) => {
    const isSelected = selectedCategoryIds.includes(catId);
    let nextCategories: string[];

    if (isSelected) {
      nextCategories = selectedCategoryIds.filter((id) => id !== catId);
      const remainingValidSubCategoryIds = selectedSubCategoryIds.filter(
        (subId) => {
          const sub = allSubCategories.find((s) => s.id === subId);
          return sub && sub.categoryId !== catId;
        },
      );
      setValue("subCategoryIds", remainingValidSubCategoryIds);
    } else {
      nextCategories = [...selectedCategoryIds, catId];
    }

    setValue("categoryIds", nextCategories, { shouldValidate: true });
  };

  const handleSubCategoryToggle = (subId: string) => {
    const isSelected = selectedSubCategoryIds.includes(subId);
    const nextSubCategories = isSelected
      ? selectedSubCategoryIds.filter((id) => id !== subId)
      : [...selectedSubCategoryIds, subId];

    setValue("subCategoryIds", nextSubCategories);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name, { shouldValidate: true });
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", slug, { shouldValidate: true });
  };

  const handleAddValue = (optionIndex: number) => {
    const rawVal = tagInputs[optionIndex]?.trim();
    if (!rawVal) return;

    const parsedValues = rawVal
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item?.length > 0);

    if (!parsedValues?.length) return;

    const currentValues = getValues(`options.${optionIndex}.values`) || [];
    const currentLowerSet = new Set(
      currentValues.map((v) => v.value.toLowerCase()),
    );

    const newValuesToAdd: { value: string }[] = [];
    for (const val of parsedValues) {
      if (!currentLowerSet.has(val.toLowerCase())) {
        currentLowerSet.add(val.toLowerCase());
        newValuesToAdd.push({ value: val });
      }
    }

    if (newValuesToAdd?.length > 0) {
      setValue(
        `options.${optionIndex}.values`,
        [...currentValues, ...newValuesToAdd],
        { shouldValidate: true, shouldDirty: true },
      );
    }

    setTagInputs((prev) => ({ ...prev, [optionIndex]: "" }));
  };

  const handleRemoveValue = (
    e: React.MouseEvent,
    optionIndex: number,
    valIndex: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const currentValues = getValues(`options.${optionIndex}.values`) || [];
    const updated = currentValues.filter((_, idx) => idx !== valIndex);
    setValue(`options.${optionIndex}.values`, updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const generateCartesianVariants = () => {
    const options = getValues("options") || [];
    const validOptions = options.filter(
      (opt) => opt.name.trim() && opt.values && opt.values?.length > 0,
    );

    if (!validOptions?.length) {
      replaceVariants([]);
      return;
    }

    const baseSku = getValues("sku")?.trim() || "SKU";
    const productBaseImage = getValues("baseImage") || "";

    const cartesian = (
      arr: { name: string; value: string }[][],
    ): { name: string; value: string }[][] => {
      return arr.reduce(
        (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
        [[]] as { name: string; value: string }[][],
      );
    };

    const optionArrays = validOptions.map((opt) =>
      opt.values.map((v) => ({ name: opt.name.trim(), value: v.value.trim() })),
    );

    const combinations = cartesian(optionArrays);

    const generated = combinations.map((comb) => {
      const skuSuffix = comb
        .map((c) =>
          c.value
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 3)
            .toUpperCase(),
        )
        .join("-");

      const combObj: Record<string, string> = {};
      comb.forEach((c) => {
        combObj[c.name] = c.value;
      });

      return {
        sku: `${baseSku}-${skuSuffix}`,
        images: productBaseImage ? [productBaseImage] : [],
        optionValueIds: [],
        combinationValues: combObj,
      };
    });

    replaceVariants(generated);
  };

  const handleAddManualVariant = () => {
    setManualError("");
    const options = getValues("options") || [];
    const validOptions = options.filter(
      (opt) => opt.name.trim() && opt.values && opt.values?.length > 0,
    );

    if (!validOptions?.length) {
      setManualError("Please define at least one option and its values first.");
      return;
    }

    for (const opt of validOptions) {
      if (!manualCombSelections[opt.name.trim()]) {
        setManualError(`Please select a value for "${opt.name}".`);
        return;
      }
    }

    const currentVariants = getValues("variants") || [];
    const baseSku = getValues("sku")?.trim() || "SKU";

    const isDuplicate = currentVariants.some((v) => {
      if (!v.combinationValues) return false;
      return Object.entries(manualCombSelections).every(
        ([k, val]) => v.combinationValues?.[k] === val,
      );
    });

    if (isDuplicate) {
      setManualError("This variant combination already exists in the list.");
      return;
    }

    const skuSuffix = Object.values(manualCombSelections)
      .map((val) =>
        val
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 3)
          .toUpperCase(),
      )
      .join("-");

    const finalSku = manualSku.trim() || `${baseSku}-${skuSuffix}`;

    appendVariant({
      sku: finalSku,
      images: manualImage
        ? [manualImage]
        : getValues("baseImage")
          ? [getValues("baseImage")!]
          : [],
      optionValueIds: [],
      combinationValues: { ...manualCombSelections },
    });

    setManualSku("");
    setManualImage("");
  };

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      sku: values.sku || undefined,
      baseImage: values.baseImage || undefined,
      description: values.description || undefined,
      categoryIds: values.categoryIds,
      subCategoryIds: values.subCategoryIds?.length
        ? values.subCategoryIds
        : undefined,
      isNew: values.isNew,
      isFeatured: values.isFeatured,
      isBestSeller: values.isBestSeller,
      isActive: values.isActive,
      options: values.options?.length
        ? values.options.map((opt) => ({
            name: opt.name.trim(),
            values: opt.values.map((v) => ({
              value: v.value.trim(),
              metadata: v.metadata,
            })),
          }))
        : undefined,
      variants: values.variants?.length
        ? values.variants.map((v) => ({
            sku: v.sku.trim(),
            images: v.images || [],
            options: v.combinationValues,
          }))
        : undefined,
    };

    await createProductMutation.mutateAsync(payload);
    router.push("/admin/products");
  };

  const validOptionList = (watch("options") || []).filter(
    (opt) => opt.name?.trim() && opt.values?.length > 0,
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Product
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Define universal attributes, images, and inventory variants
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? "Creating..." : "Save Product"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>
              Product identity, base image, and descriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              <div className="space-y-3 flex flex-col items-center">
                <Label className="self-start text-sm font-semibold">
                  Base Product Image
                </Label>
                <div className="w-full max-w-[240px]">
                  <Controller
                    control={control}
                    name="baseImage"
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {errors.baseImage && (
                  <p className="text-xs text-destructive self-start">
                    {errors.baseImage.message}
                  </p>
                )}
              </div>

              <div className="lg:col-span-3 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Nike Air Pegasus 39"
                      {...register("name")}
                      onChange={handleNameChange}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      placeholder="nike-air-pegasus-39"
                      {...register("slug")}
                    />
                    {errors.slug && (
                      <p className="text-xs text-destructive">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">Base SKU (Optional Prefix)</Label>
                  <Input
                    id="sku"
                    placeholder="NIKE-AIR-PEG"
                    {...register("sku")}
                  />
                  {errors.sku && (
                    <p className="text-xs text-destructive">
                      {errors.sku.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Detailed description of the product..."
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories & Sub-Categories</CardTitle>
            <CardDescription>
              Select primary categories; sub-categories will filter
              automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Categories (Multi-Select)
                </Label>
                <Popover
                  open={openCategoryDropdown}
                  onOpenChange={setOpenCategoryDropdown}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryDropdown}
                      className="w-full justify-between font-normal"
                    >
                      {selectedCategoryIds?.length > 0
                        ? `${selectedCategoryIds?.length} categories selected`
                        : "Select categories..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandList>
                        <CommandEmpty>
                          {categoriesLoading
                            ? "Loading..."
                            : "No category found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {categories.map((cat) => {
                            const isSelected = selectedCategoryIds.includes(
                              cat.id,
                            );
                            return (
                              <CommandItem
                                key={cat.id}
                                value={cat.name}
                                onSelect={() => handleCategoryToggle(cat.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {cat.name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-wrap gap-2 min-h-[32px] pt-1">
                  {selectedCategoryIds.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    if (!cat) return null;
                    return (
                      <Badge
                        key={id}
                        variant="default"
                        className="gap-1.5 text-xs py-1 px-3"
                      >
                        {cat.name}
                        <button
                          type="button"
                          className="rounded-full hover:bg-primary-foreground/20 p-0.5"
                          onClick={() => handleCategoryToggle(id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
                {errors.categoryIds && (
                  <p className="text-xs text-destructive">
                    {errors.categoryIds.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Sub Categories (Filtered)
                </Label>
                <Popover
                  open={openSubCategoryDropdown}
                  onOpenChange={setOpenSubCategoryDropdown}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={!selectedCategoryIds?.length}
                      aria-expanded={openSubCategoryDropdown}
                      className="w-full justify-between font-normal"
                    >
                      {!selectedCategoryIds?.length
                        ? "Select category first"
                        : selectedSubCategoryIds?.length > 0
                          ? `${selectedSubCategoryIds?.length} sub-categories selected`
                          : "Select sub-categories..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search sub-category..." />
                      <CommandList>
                        <CommandEmpty>
                          {subCategoriesLoading
                            ? "Loading..."
                            : filteredSubCategories?.length === 0
                              ? "No sub-categories available for selected categories."
                              : "No sub-category found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredSubCategories.map((sub) => {
                            const isSelected = selectedSubCategoryIds.includes(
                              sub.id,
                            );
                            return (
                              <CommandItem
                                key={sub.id}
                                value={sub.name}
                                onSelect={() => handleSubCategoryToggle(sub.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {sub.name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-wrap gap-2 min-h-[32px] pt-1">
                  {selectedSubCategoryIds.map((id) => {
                    const sub = allSubCategories.find((s) => s.id === id);
                    if (!sub) return null;
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1.5 text-xs py-1 px-3"
                      >
                        {sub.name}
                        <button
                          type="button"
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                          onClick={() => handleSubCategoryToggle(id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>1. Define Product Options</CardTitle>
              <CardDescription>
                Select universal attribute names and add values (comma separated
                allowed, e.g. Red, Green, Blue)
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendOption({ name: "", values: [] })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {optionFields?.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Layers className="mx-auto h-9 w-9 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No options added</p>
                <p className="text-xs text-muted-foreground">
                  If this product has choices like Color or Size, click
                  &quot;Add Option&quot;.
                </p>
              </div>
            ) : (
              optionFields.map((field, optionIdx) => {
                const currentVals = watch(`options.${optionIdx}.values`) || [];

                return (
                  <div
                    key={field.id}
                    className="border rounded-xl p-5 space-y-4 bg-muted/20"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 max-w-sm space-y-2">
                        <Label className="font-semibold">Option Name</Label>
                        <Controller
                          control={control}
                          name={`options.${optionIdx}.name`}
                          render={({ field: nameField }) => (
                            <Popover
                              open={openOptionDropdown[optionIdx]}
                              onOpenChange={(isOpen) =>
                                setOpenOptionDropdown((prev) => ({
                                  ...prev,
                                  [optionIdx]: isOpen,
                                }))
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between font-normal",
                                    !nameField.value && "text-muted-foreground",
                                  )}
                                >
                                  {nameField.value ||
                                    "Select or type attribute..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[320px] p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput placeholder="Search or type attribute..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      <div className="p-2">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          className="w-full text-left justify-start text-xs"
                                          onClick={() => {
                                            const searchVal = (
                                              document.querySelector(
                                                "[cmdk-input]",
                                              ) as HTMLInputElement
                                            )?.value;
                                            if (searchVal) {
                                              nameField.onChange(searchVal);
                                              setOpenOptionDropdown((prev) => ({
                                                ...prev,
                                                [optionIdx]: false,
                                              }));
                                            }
                                          }}
                                        >
                                          Use custom name
                                        </Button>
                                      </div>
                                    </CommandEmpty>
                                    <CommandGroup heading="Standard Attributes">
                                      {PRESET_OPTIONS.map((opt) => (
                                        <CommandItem
                                          key={opt}
                                          value={opt}
                                          onSelect={() => {
                                            nameField.onChange(opt);
                                            setOpenOptionDropdown((prev) => ({
                                              ...prev,
                                              [optionIdx]: false,
                                            }));
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              opt.toLowerCase() ===
                                                nameField.value?.toLowerCase()
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          {opt}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {errors.options?.[optionIdx]?.name && (
                          <p className="text-xs text-destructive">
                            {errors.options[optionIdx]?.name?.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive self-end"
                        onClick={() => removeOption(optionIdx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground font-medium">
                        Option Values
                      </Label>
                      <div className="flex flex-wrap items-center gap-2 mb-2 min-h-[32px]">
                        {currentVals.map((v, valIdx) => (
                          <Badge
                            key={`${v.value}-${valIdx}`}
                            variant="secondary"
                            className="gap-2 py-1 px-3 text-xs font-medium"
                          >
                            <span>{v.value}</span>
                            <button
                              type="button"
                              className="rounded-full hover:bg-destructive hover:text-destructive-foreground p-0.5 inline-flex items-center justify-center transition-colors"
                              onClick={(e) =>
                                handleRemoveValue(e, optionIdx, valIdx)
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 max-w-md">
                        <Input
                          placeholder="Add values e.g. Red, Green, Blue"
                          value={tagInputs[optionIdx] || ""}
                          onChange={(e) =>
                            setTagInputs((prev) => ({
                              ...prev,
                              [optionIdx]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddValue(optionIdx);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleAddValue(optionIdx)}
                        >
                          Add
                        </Button>
                      </div>
                      {errors.options?.[optionIdx]?.values && (
                        <p className="text-xs text-destructive">
                          {errors.options[optionIdx]?.values?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>2. Product Variants</CardTitle>
              <CardDescription>
                Generate all combinations automatically or build individual
                variants manually
              </CardDescription>
            </div>
            {optionFields?.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-primary/5 hover:bg-primary/10 border-primary/20"
                onClick={generateCartesianVariants}
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Generate All Combinations
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {validOptionList?.length > 0 && (
              <div className="border rounded-xl p-5 bg-muted/20 space-y-5">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-primary" />
                  <Label className="font-semibold text-sm">
                    Add Specific Variant Manually
                  </Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  {validOptionList.map((opt) => (
                    <div key={opt.name} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {opt.name}
                      </Label>
                      <Select
                        value={manualCombSelections[opt.name.trim()] || ""}
                        onValueChange={(val) =>
                          setManualCombSelections((prev) => ({
                            ...prev,
                            [opt.name.trim()]: val,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder={`Select ${opt.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {opt.values.map((v, i) => (
                            <SelectItem key={i} value={v.value.trim()}>
                              {v.value.trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Custom SKU (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. NIKE-RED-M"
                      className="bg-background"
                      value={manualSku}
                      onChange={(e) => setManualSku(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 shrink-0">
                      <ImageUpload
                        value={manualImage}
                        onChange={setManualImage}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Variant image (optional, inherits base product image if
                      empty)
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddManualVariant}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add This Variant
                  </Button>
                </div>

                {manualError && (
                  <p className="text-xs text-destructive font-medium">
                    {manualError}
                  </p>
                )}
              </div>
            )}

            {variantFields?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 border rounded-xl border-dashed">
                No variants added yet. Use the manual selector above or click
                &quot;Generate All Combinations&quot;.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Variant List ({variantFields?.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={() => replaceVariants([])}
                  >
                    Clear All Variants
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {variantFields.map((field, variantIdx) => {
                    const combValues = watch(
                      `variants.${variantIdx}.combinationValues`,
                    );

                    return (
                      <div
                        key={field.id}
                        className="border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card"
                      >
                        <div className="w-24 h-24 shrink-0">
                          <Controller
                            control={control}
                            name={`variants.${variantIdx}.images`}
                            render={({ field: imgField }) => (
                              <ImageUpload
                                value={imgField.value?.[0] || ""}
                                onChange={(url) =>
                                  imgField.onChange(url ? [url] : [])
                                }
                              />
                            )}
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {combValues ? (
                              Object.entries(combValues).map(([k, v]) => (
                                <Badge
                                  key={k}
                                  variant="outline"
                                  className="text-xs font-normal py-1 px-2.5"
                                >
                                  <span className="font-semibold text-muted-foreground mr-1">
                                    {k}:
                                  </span>
                                  {v}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm font-medium">
                                Default Variant
                              </span>
                            )}
                          </div>

                          <div className="max-w-md">
                            <Label className="text-xs text-muted-foreground">
                              SKU Code
                            </Label>
                            <Input
                              placeholder="Variant SKU"
                              {...register(`variants.${variantIdx}.sku`)}
                            />
                            {errors.variants?.[variantIdx]?.sku && (
                              <p className="text-xs text-destructive mt-1">
                                {errors.variants[variantIdx]?.sku?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive self-end md:self-center"
                          onClick={() => removeVariant(variantIdx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility & Badges</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Visible in store
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="isNew"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">New Arrival</Label>
                    <p className="text-xs text-muted-foreground">
                      Badge &apos;New&apos;
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Featured</Label>
                    <p className="text-xs text-muted-foreground">
                      Feature on home
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="isBestSeller"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Best Seller</Label>
                    <p className="text-xs text-muted-foreground">
                      Best seller badge
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
