"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Info,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  type CSSProperties,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { categorySchema } from "@/lib/validators";
import { slug } from "@/lib/slug";
import { ImageUpload } from "@/components/ui/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/store/useThemeStore";

interface SubCategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

interface CategoryResponseItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  subCategories?: SubCategoryItem[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  productsCount: number;
  image?: string | null;
  subCategories?: SubCategoryItem[];
}

interface StatCard {
  label: string;
  value: string;
  badge: string | null;
  bColor?: string;
}

type CategoryFormValues = z.infer<typeof categorySchema>;

const AdminCategoriesContent = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [primaryColor, setPrimaryColor] = useState<string>("#111827");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    setIsMounted(true);
    setPrimaryColor(useThemeStore.getState().primaryColor);
  }, []);

  const { data: categoriesResponse, isLoading: isFetching } = useCategories(
    currentPage,
    pageSize,
  );
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", image: "" },
  });

  const rawCategories: CategoryResponseItem[] = useMemo(() => {
    const data = categoriesResponse?.data;
    if (Array.isArray(data?.categories)) return data.categories;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  }, [categoriesResponse]);

  const totalCategories: number = useMemo(() => {
    const meta = categoriesResponse?.data?.meta;
    if (typeof meta?.totalCategories === "number") return meta.totalCategories;
    return rawCategories?.length;
  }, [categoriesResponse, rawCategories]);

  const categoriesData: Category[] = useMemo(() => {
    return rawCategories.map((cat: CategoryResponseItem) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productsCount: cat.subCategories?.length || 0,
      image: cat.image,
      subCategories: cat.subCategories || [],
    }));
  }, [rawCategories]);

  const filteredCategories: Category[] = useMemo(() => {
    if (!searchTerm.trim()) return categoriesData;
    const q = searchTerm.trim().toLowerCase();
    return categoriesData.filter(
      (cat: Category) =>
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        cat.subCategories?.some((sub: SubCategoryItem) =>
          sub.name.toLowerCase().includes(q),
        ),
    );
  }, [categoriesData, searchTerm]);

  const nameValue = watch("name");

  useEffect(() => {
    if (nameValue && (isCreateOpen || isEditOpen)) {
      setValue("slug", slug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue, isCreateOpen, isEditOpen]);

  useEffect(() => {
    if (selectedCategory && isEditOpen) {
      const cat = rawCategories.find(
        (c: CategoryResponseItem) => c.id === selectedCategory.id,
      );
      if (cat) {
        reset({
          name: cat.name,
          slug: cat.slug,
          image: cat.image || "",
        });
      }
    }
  }, [selectedCategory, isEditOpen, reset, rawCategories]);

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
  }, []);

  const onCreateSubmit = async (values: CategoryFormValues) => {
    try {
      await createCategoryMutation.mutateAsync({
        name: values.name,
        slug: values.slug,
        image: values.image || null,
      });
      setIsCreateOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const onEditSubmit = async (values: CategoryFormValues) => {
    if (!selectedCategory) return;
    try {
      await updateCategoryMutation.mutateAsync({
        id: selectedCategory.id,
        payload: {
          name: values.name,
          slug: values.slug,
          image: values.image || null,
        },
      });
      setIsEditOpen(false);
      setSelectedCategory(null);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategoryMutation.mutateAsync(selectedCategory.id);
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error(error);
    }
  };

  const viewCategoryDetails: CategoryResponseItem | null = useMemo(() => {
    if (!selectedCategory) return null;
    return (
      rawCategories.find(
        (c: CategoryResponseItem) => c.id === selectedCategory.id,
      ) || null
    );
  }, [selectedCategory, rawCategories]);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("CATEGORY NAME"),
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div className="flex items-center gap-4 py-1">
            <div className="relative h-10 w-10 rounded-xl border bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
              {cat.image ? (
                <Image src={cat.image} alt="" fill className="object-cover" />
              ) : (
                <LayoutGrid size={18} />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{cat.name}</p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                Slug: {cat.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "productsCount",
      header: createSortableHeader("SUBCATEGORIES"),
      cell: ({ row }) => (
        <span className="font-mono font-bold text-gray-600">
          {row.original.productsCount}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
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
                  setSelectedCategory(row.original);
                  setIsEditOpen(true);
                }}
              >
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm cursor-pointer"
                onClick={() => {
                  setSelectedCategory(row.original);
                  setIsViewOpen(true);
                }}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm text-red-500 cursor-pointer"
                onClick={() => {
                  setSelectedCategory(row.original);
                  setIsDeleteOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const comboboxOptions = useMemo(() => {
    return categoriesData.map((cat: Category) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categoriesData]);

  const statsList: StatCard[] = useMemo(
    () => [
      {
        label: "Total Categories",
        value: totalCategories.toString(),
        badge: "+4 this month",
        bColor: "bg-green-50 text-green-600",
      },
      { label: "Active Products", value: "1,284", badge: null },
      {
        label: "Empty Categories",
        value: totalCategories === 0 ? "0" : "03",
        badge: "Attention",
        bColor: "bg-red-50 text-red-600",
      },
      { label: "Avg. Depth", value: "2.4", badge: null },
    ],
    [totalCategories],
  );

  if (!isMounted) {
    return null;
  }

  return (
    <div
      style={dynamicStyles}
      className="space-y-10 animate-in fade-in duration-700"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Categories
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Hierarchical product structure management
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 border-gray-200 font-bold text-gray-500"
          >
            <Download size={18} className="mr-2" /> Export
          </Button>

          <Dialog
            open={isCreateOpen}
            onOpenChange={(val: boolean) => {
              setIsCreateOpen(val);
              if (!val) reset();
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer">
                <Plus size={20} className="mr-2" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  Add New Category
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                  Create a parent category for your store
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateSubmit)}
                className="space-y-6 py-4"
              >
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">
                    Category Image
                  </Label>
                  <Controller
                    name="image"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value || ""}
                        onChange={(url: string) =>
                          setValue("image", url, { shouldValidate: true })
                        }
                      />
                    )}
                  />
                  {errors.image && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.image.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-gray-700">
                    Category Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Electronics"
                    className="h-12 rounded-xl border-gray-200"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="font-bold text-gray-700">
                    Category Slug
                  </Label>
                  <Input
                    id="slug"
                    placeholder="e.g., electronics"
                    className="h-12 rounded-xl border-gray-200"
                    {...register("slug")}
                  />
                  {errors.slug && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createCategoryMutation.isPending}
                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
                  >
                    {createCategoryMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      "Create Category"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Dialog
        open={isEditOpen}
        onOpenChange={(val: boolean) => {
          setIsEditOpen(val);
          if (!val) {
            setSelectedCategory(null);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Edit Category
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Modify selected parent category
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="space-y-6 py-4"
          >
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Category Image</Label>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value || ""}
                    onChange={(url: string) =>
                      setValue("image", url, { shouldValidate: true })
                    }
                  />
                )}
              />
              {errors.image && (
                <p className="text-xs font-bold text-red-500">
                  {errors.image.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-bold text-gray-700">
                Category Name
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Electronics"
                className="h-12 rounded-xl border-gray-200"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs font-bold text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug" className="font-bold text-gray-700">
                Category Slug
              </Label>
              <Input
                id="edit-slug"
                placeholder="e.g., electronics"
                className="h-12 rounded-xl border-gray-200"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-xs font-bold text-red-500">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={updateCategoryMutation.isPending}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
              >
                {updateCategoryMutation.isPending ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isViewOpen}
        onOpenChange={(val: boolean) => {
          setIsViewOpen(val);
          if (!val) setSelectedCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Category Details
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Full metadata of selected parent category
            </DialogDescription>
          </DialogHeader>
          {viewCategoryDetails && (
            <div className="space-y-4 py-4">
              {viewCategoryDetails.image && (
                <div className="relative h-40 w-full rounded-2xl border overflow-hidden bg-gray-50">
                  <Image
                    src={viewCategoryDetails.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  ID
                </span>
                <span className="text-sm font-black text-gray-900">
                  {viewCategoryDetails.id}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Name
                </span>
                <span className="text-sm font-black text-gray-900">
                  {viewCategoryDetails.name}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Slug
                </span>
                <span className="text-sm font-black text-gray-900">
                  {viewCategoryDetails.slug}
                </span>
              </div>
              {viewCategoryDetails.subCategories &&
                viewCategoryDetails.subCategories?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider block">
                      Subcategories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {viewCategoryDetails.subCategories.map(
                        (sub: SubCategoryItem) => (
                          <Badge
                            key={sub.id}
                            variant="secondary"
                            className="bg-slate-100 border text-slate-700"
                          >
                            {sub.name}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
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
              category and all its subcategories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedCategory(null)}
              className="rounded-xl font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteCategoryMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6 cursor-pointer"
            >
              {deleteCategoryMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by category name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        <div className="w-full sm:w-72">
          <Combobox
            options={comboboxOptions}
            value=""
            onChange={(val: string) => {
              const selected = categoriesData.find(
                (c: Category) => c.id === val,
              );
              if (selected) {
                setSelectedCategory(selected);
                setIsViewOpen(true);
              }
            }}
            placeholder="Jump to category details..."
          />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsList.map((stat: StatCard) => (
          <div
            key={stat.label}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {stat.label}
            </p>
            <div className="flex items-end gap-3 mt-4">
              <p className="text-4xl font-black text-gray-900 tracking-tighter">
                {stat.value}
              </p>
              {stat.badge && (
                <Badge
                  className={`rounded-full border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest ${stat.bColor}`}
                >
                  {stat.badge}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </section>

      <DataTable
        columns={columns}
        data={filteredCategories}
        totalCount={filteredCategories?.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetching}
        title="Category Hierarchy"
        className="rounded-[2.5rem] border-none shadow-none bg-transparent"
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 p-10 rounded-[3rem] bg-[var(--primary)] text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Info size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase">
                Management Tip
              </h3>
            </div>
            <p className="text-white/80 max-w-lg font-medium leading-relaxed">
              You can drag and drop categories in the detailed view to reorder
              them or change parent-child relationships.
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="xl:col-span-2 p-10 rounded-[3rem] bg-gray-100 border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-[1.5rem] shadow-sm text-gray-400">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase">
              Performance
            </h4>
          </div>
          <p className="text-sm text-gray-500 font-medium leading-relaxed italic mt-6">
            &quot;Fashion&quot; is your highest converting category this week
            with a{" "}
            <span className="text-green-600 font-black">12% increase</span> in
            sales.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesContent;
