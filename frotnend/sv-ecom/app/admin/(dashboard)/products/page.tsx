"use client";

import { useState, useCallback, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Edit3,
  Eye,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  Package,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { type Product } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const router = useRouter();
  const { primaryColor } = useThemeStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: productsResponse, isLoading: isFetching } = useProducts({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
  });

  const deleteProductMutation = useDeleteProduct();

  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
    if (params.search !== undefined) {
      setSearchQuery(params.search);
    }
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
    }
  };

  const products = productsResponse?.data?.items || [];
  const totalProducts = productsResponse?.meta?.total || 0;

  const activeCount = products.filter((p) => p.isActive)?.length;
  const featuredCount = products.filter((p) => p.isFeatured)?.length;
  const totalVariantsCount = products.reduce(
    (acc, p) => acc + (p.variants?.length || 0),
    0,
  );

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("PRODUCT"),
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div className="flex items-center gap-4 py-1">
            <div className="relative h-12 w-12 rounded-xl border bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
              {prod.baseImage ? (
                <Image
                  src={prod.baseImage}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <Package size={20} />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 line-clamp-1">
                {prod.name}
              </p>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                SKU: {prod.sku || "N/A"} • Slug: {prod.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "categories",
      header: "CATEGORIES",
      cell: ({ row }) => {
        const cats = row.original.categories || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {cats?.length === 0 ? (
              <span className="text-xs text-gray-400">Uncategorized</span>
            ) : (
              cats.map((c) => (
                <Badge
                  key={c.id}
                  variant="secondary"
                  className="text-[10px] py-0 px-2 bg-gray-100 font-medium"
                >
                  {c.category?.name}
                </Badge>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: "variants",
      header: "OPTIONS & VARIANTS",
      cell: ({ row }) => {
        const prod = row.original;
        const optionsCount = prod.productOptions?.length || 0;
        const variantsCount = prod.variants?.length || 0;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold">
                {variantsCount} Variants
              </Badge>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              {optionsCount} Options (
              {prod.productOptions?.map((o) => o.name).join(", ") || "None"})
            </p>
          </div>
        );
      },
    },
    {
      id: "badges",
      header: "BADGES",
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            {prod.isNew && (
              <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-black uppercase">
                New
              </Badge>
            )}
            {prod.isFeatured && (
              <Badge className="bg-amber-50 text-amber-600 border-none text-[9px] font-black uppercase">
                Featured
              </Badge>
            )}
            {prod.isBestSeller && (
              <Badge className="bg-purple-50 text-purple-600 border-none text-[9px] font-black uppercase">
                Best Seller
              </Badge>
            )}
            {!prod.isActive && (
              <Badge className="bg-red-50 text-red-600 border-none text-[9px] font-black uppercase">
                Inactive
              </Badge>
            )}
          </div>
        );
      },
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
                className="h-8 w-8 text-gray-400"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem
                className="font-bold text-sm"
                onClick={() => {
                  setSelectedProduct(row.original);
                  setIsViewOpen(true);
                }}
              >
                <Eye size={14} className="mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm"
                onClick={() =>
                  router.push(`/admin/products/edit/${row.original.id}`)
                }
              >
                <Edit3 size={14} className="mr-2" /> Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm text-red-500"
                onClick={() => {
                  setSelectedProduct(row.original);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div
      style={dynamicStyles}
      className="space-y-10 animate-in fade-in duration-700"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Products
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Universal product & dynamic variant catalogue
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 border-gray-200 font-bold text-gray-500"
          >
            <Download size={18} className="mr-2" /> Export
          </Button>

          <Button
            onClick={() => router.push("/admin/products/create")}
            className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
          >
            <Plus size={20} className="mr-2" /> Add Product
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: "Total Products",
            value: totalProducts.toString(),
            badge: "Catalogue",
            bColor: "bg-blue-50 text-blue-600",
          },
          {
            label: "Active In Store",
            value: activeCount.toString(),
            badge: "Live",
            bColor: "bg-green-50 text-green-600",
          },
          {
            label: "Total Variants",
            value: totalVariantsCount.toString(),
            badge: "SKUs",
            bColor: "bg-purple-50 text-purple-600",
          },
          {
            label: "Featured Items",
            value: featuredCount.toString(),
            badge: "Homepage",
            bColor: "bg-amber-50 text-amber-600",
          },
        ].map((stat) => (
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
        data={products}
        totalCount={totalProducts}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetching}
        title="Product Inventory"
        className="rounded-[2.5rem] border-none shadow-none bg-transparent"
      />

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Product Overview
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Full specification and variant combinations
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="flex gap-4 items-start">
                <div className="relative h-20 w-20 rounded-2xl border bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {selectedProduct.baseImage ? (
                    <Image
                      src={selectedProduct.baseImage}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Package size={28} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    Slug: {selectedProduct.slug} • SKU:{" "}
                    {selectedProduct.sku || "N/A"}
                  </p>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    Description
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Configured Options & Values
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProduct.productOptions?.map((opt) => (
                    <div
                      key={opt.id}
                      className="border rounded-xl p-3 bg-white space-y-1.5"
                    >
                      <span className="text-xs font-bold text-gray-900">
                        {opt.name}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opt.productOptionValues?.map((val) => (
                          <Badge
                            key={val.id}
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            {val.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Sellable Variant Permutations (
                  {selectedProduct.variants?.length || 0})
                </span>
                <div className="border rounded-xl divide-y max-h-[220px] overflow-y-auto">
                  {selectedProduct.variants?.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <span className="font-bold text-gray-900">{v.sku}</span>
                      <div className="flex flex-wrap gap-1">
                        {v.productVariantValues?.map((pvv) => (
                          <Badge
                            key={pvv.id}
                            variant="outline"
                            className="text-[10px] font-normal"
                          >
                            <span className="text-gray-400 mr-1">
                              {pvv.optionValue?.option?.name}:
                            </span>
                            {pvv.optionValue?.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
              This will permanently delete this product and all its variant
              combinations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedProduct(null)}
              className="rounded-xl font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteProductMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
