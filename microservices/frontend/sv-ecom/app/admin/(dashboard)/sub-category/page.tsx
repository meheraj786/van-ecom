"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Edit3,
  Info,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useState,
  useEffect,
  useMemo,
  type ChangeEvent,
} from "react";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateSubCategory,
  useSubCategories,
  useUpdateSubCategory,
  useDeleteSubCategory,
} from "@/hooks/useSubCategories";
import { subCategorySchema } from "@/lib/validators";
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

type SubCategoryFormValues = z.infer<typeof subCategorySchema>;

interface SubCategoryApiItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  image?: string | null;
}

interface CategoryApiItem {
  id: string;
  name: string;
  slug?: string;
  subCategories?: Array<{ id: string; name: string; slug: string }>;
}

interface SubCategoryTableItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  image?: string | null;
}

const AdminSubCategoriesPage = () => {
  const { primaryColor } = useThemeStore();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [parentFilter, setParentFilter] = useState<string>("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoryTableItem | null>(null);

  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const { data: subResponse, isLoading: isFetchingSubs } = useSubCategories(
    currentPage,
    pageSize,
  );
  const createSubMutation = useCreateSubCategory();
  const updateSubMutation = useUpdateSubCategory();
  const deleteSubMutation = useDeleteSubCategory();

  const { data: categoriesResponse } = useCategories(1, 100);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: { name: "", slug: "", categoryId: "", image: "" },
  });

  const nameValue = watch("name");
  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    if (nameValue && (isCreateOpen || isEditOpen)) {
      setValue("slug", slug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue, isCreateOpen, isEditOpen]);

  const rawSubCategories: SubCategoryApiItem[] = useMemo(() => {
    const data = subResponse?.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  }, [subResponse]);

  const rawCategories: CategoryApiItem[] = useMemo(() => {
    const data = categoriesResponse?.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.categories)) return data.categories;
    if (Array.isArray(data)) return data;
    return [];
  }, [categoriesResponse]);

  useEffect(() => {
    if (selectedSubCategory && isEditOpen) {
      const sub = rawSubCategories.find(
        (s: SubCategoryApiItem) => s.id === selectedSubCategory.id,
      );
      if (sub) {
        reset({
          name: sub.name,
          slug: sub.slug,
          categoryId: sub.categoryId,
          image: sub.image || "",
        });
      }
    }
  }, [selectedSubCategory, isEditOpen, reset, rawSubCategories]);

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
  }, []);

  const onCreateSubmit = async (values: SubCategoryFormValues) => {
    try {
      await createSubMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const onEditSubmit = async (values: SubCategoryFormValues) => {
    if (!selectedSubCategory) return;
    try {
      await updateSubMutation.mutateAsync({
        id: selectedSubCategory.id,
        payload: values,
      });
      setIsEditOpen(false);
      setSelectedSubCategory(null);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubCategory) return;
    try {
      await deleteSubMutation.mutateAsync(selectedSubCategory.id);
      setIsDeleteOpen(false);
      setSelectedSubCategory(null);
    } catch (error) {
      console.error(error);
    }
  };

  const categoriesMap = useMemo(() => {
    return new Map<string, string>(
      rawCategories.map((c: CategoryApiItem) => [c.id, c.name]),
    );
  }, [rawCategories]);

  const subCategoriesData: SubCategoryTableItem[] = useMemo(() => {
    return rawSubCategories.map((sub: SubCategoryApiItem) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      categoryId: sub.categoryId,
      categoryName: categoriesMap.get(sub.categoryId) || "Unknown Category",
      image: sub.image,
    }));
  }, [rawSubCategories, categoriesMap]);

  const filteredSubCategories: SubCategoryTableItem[] = useMemo(() => {
    let list = subCategoriesData;

    if (parentFilter !== "ALL") {
      list = list.filter(
        (s: SubCategoryTableItem) => s.categoryId === parentFilter,
      );
    }

    if (!searchTerm.trim()) return list;
    const q = searchTerm.trim().toLowerCase();

    return list.filter(
      (sub: SubCategoryTableItem) =>
        sub.name.toLowerCase().includes(q) ||
        sub.slug.toLowerCase().includes(q) ||
        sub.categoryName.toLowerCase().includes(q),
    );
  }, [subCategoriesData, searchTerm, parentFilter]);

  // const totalSubCategories: number = useMemo(() => {
  //   const meta = subResponse?.data?.meta || subResponse?.meta;
  //   if (typeof meta?.totalSubCategories === "number")
  //     return meta.totalSubCategories;
  //   return subCategoriesData?.length;
  // }, [subResponse, subCategoriesData]);

  const viewSubCategoryDetails: SubCategoryApiItem | null = useMemo(() => {
    if (!selectedSubCategory) return null;
    return (
      rawSubCategories.find(
        (s: SubCategoryApiItem) => s.id === selectedSubCategory.id,
      ) || null
    );
  }, [selectedSubCategory, rawSubCategories]);

  const columns: ColumnDef<SubCategoryTableItem>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("SUBCATEGORY NAME"),
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="flex items-center gap-4 py-1">
            <div className="relative h-10 w-10 rounded-xl border bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
              {sub.image ? (
                <Image src={sub.image} alt="" fill className="object-cover" />
              ) : (
                <LayoutGrid size={18} />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{sub.name}</p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5 font-mono">
                Slug: {sub.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: createSortableHeader("PARENT CATEGORY"),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200"
        >
          {row.original.categoryName}
        </Badge>
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
                  setSelectedSubCategory(row.original);
                  setIsEditOpen(true);
                }}
              >
                Edit Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm cursor-pointer"
                onClick={() => {
                  setSelectedSubCategory(row.original);
                  setIsViewOpen(true);
                }}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm text-red-500 cursor-pointer"
                onClick={() => {
                  setSelectedSubCategory(row.original);
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

  const categoriesOptions = useMemo(() => {
    return rawCategories.map((cat: CategoryApiItem) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [rawCategories]);

  return (
    <div
      style={dynamicStyles}
      className="space-y-8 animate-in fade-in duration-700"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Subcategories
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Secondary level product structure management
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 border-gray-200 font-bold text-gray-500 cursor-pointer"
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
                <Plus size={20} className="mr-2" /> Add Subcategory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  Add Subcategory
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                  Create a secondary child category
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateSubmit)}
                className="space-y-6 py-4"
              >
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">
                    Subcategory Image
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
                  <Label className="font-bold text-gray-700">
                    Parent Category
                  </Label>
                  <Combobox
                    options={categoriesOptions}
                    value={selectedCategoryId}
                    onChange={(val: string) =>
                      setValue("categoryId", val, { shouldValidate: true })
                    }
                    placeholder="Search parent category..."
                  />
                  {errors.categoryId && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-gray-700">
                    Subcategory Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Android Devices"
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
                    Subcategory Slug
                  </Label>
                  <Input
                    id="slug"
                    placeholder="e.g., android-devices"
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
                    disabled={createSubMutation.isPending}
                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
                  >
                    {createSubMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      "Create Subcategory"
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
            setSelectedSubCategory(null);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Edit Subcategory
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Modify selected secondary category
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="space-y-6 py-4"
          >
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">
                Subcategory Image
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
              <Label className="font-bold text-gray-700">Parent Category</Label>
              <Combobox
                options={categoriesOptions}
                value={selectedCategoryId}
                onChange={(val: string) =>
                  setValue("categoryId", val, { shouldValidate: true })
                }
                placeholder="Search parent category..."
              />
              {errors.categoryId && (
                <p className="text-xs font-bold text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-bold text-gray-700">
                Subcategory Name
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Android Devices"
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
                Subcategory Slug
              </Label>
              <Input
                id="edit-slug"
                placeholder="e.g., android-devices"
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
                disabled={updateSubMutation.isPending}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
              >
                {updateSubMutation.isPending ? (
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
          if (!val) setSelectedSubCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Subcategory Details
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Full metadata of selected secondary category
            </DialogDescription>
          </DialogHeader>
          {viewSubCategoryDetails && (
            <div className="space-y-4 py-4">
              {viewSubCategoryDetails.image && (
                <div className="relative h-40 w-full rounded-2xl border overflow-hidden bg-gray-50">
                  <Image
                    src={viewSubCategoryDetails.image}
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
                <span className="text-sm font-black text-gray-900 font-mono">
                  {viewSubCategoryDetails.id}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Name
                </span>
                <span className="text-sm font-black text-gray-900">
                  {viewSubCategoryDetails.name}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Slug
                </span>
                <span className="text-sm font-black text-gray-900 font-mono">
                  {viewSubCategoryDetails.slug}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Parent Category ID
                </span>
                <span className="text-sm font-black text-gray-900 font-mono">
                  {viewSubCategoryDetails.categoryId}
                </span>
              </div>
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
              subcategory from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedSubCategory(null)}
              className="rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteSubMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6 cursor-pointer"
            >
              {deleteSubMutation.isPending ? (
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
            placeholder="Search subcategory or parent..."
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

        <div className="w-full sm:w-72">
          <Combobox
            options={[
              { value: "ALL", label: "All Parent Categories" },
              ...categoriesOptions,
            ]}
            value={parentFilter}
            onChange={(val: string) => {
              setParentFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Filter by parent category..."
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSubCategories}
        totalCount={filteredSubCategories?.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetchingSubs}
        title="Subcategory Hierarchy"
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
              You can drag and drop items in the detailed view to reorder them
              or change parent-child relationships.
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

export default AdminSubCategoriesPage;
