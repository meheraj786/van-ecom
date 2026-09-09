"use client";

import { useState, useCallback, useMemo, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Edit3,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import {
  useStocks,
  useUpdateBatch,
  useDeleteBatch,
} from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { type StockBatch } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
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

interface OptionValue {
  id?: string;
  value?: string;
  option?: {
    name?: string;
  };
}

interface ProductVariantValue {
  optionValue?: OptionValue;
  value?: string;
}

interface ProductVariant {
  id: string;
  sku?: string;
  images?: string[];
  productVariantValues?: ProductVariantValue[];
}

interface ProductItem {
  id: string;
  name: string;
  baseImage?: string;
  variants?: ProductVariant[];
}

interface VariantDetails {
  productName: string;
  sku: string;
  image: string;
  options: Record<string, string>;
}

interface StatCard {
  label: string;
  value: string;
  badge: string;
  bColor: string;
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const { primaryColor } = useThemeStore();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "IN_STOCK" | "SOLD_OUT"
  >("ALL");

  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);
  const [editPurchasePrice, setEditPurchasePrice] = useState<number>(0);
  const [editQuantityRemaining, setEditQuantityRemaining] = useState<number>(0);
  const [editIsDiscounted, setEditIsDiscounted] = useState<boolean>(false);
  const [editBeforeDiscount, setEditBeforeDiscount] = useState<
    number | undefined
  >(undefined);
  const [editNote, setEditNote] = useState<string>("");

  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const { data: stocksResponse, isLoading: isFetchingStocks } = useStocks({
    page: currentPage,
    limit: pageSize,
  });

  const { data: productsResponse } = useProducts({ page: 1, limit: 100 });

  const updateBatchMutation = useUpdateBatch();
  const deleteBatchMutation = useDeleteBatch();

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
  }, []);

  const batches: StockBatch[] = useMemo(() => {
    const data = stocksResponse?.data;
    if (Array.isArray(data?.stocks)) return data.stocks;
    return [];
  }, [stocksResponse]);

  const totalBatches: number = useMemo(() => {
    const meta = stocksResponse?.data?.meta;
    if (typeof meta?.totalStocks === "number") return meta.totalStocks;
    return batches?.length;
  }, [stocksResponse, batches]);

  const productsList: any = useMemo(() => {
    const data = productsResponse?.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  }, [productsResponse]);

  const variantLookup = useMemo(() => {
    const map = new Map<string, VariantDetails>();

    productsList.forEach((prod: ProductItem) => {
      prod.variants?.forEach((v: ProductVariant) => {
        const optMap: Record<string, string> = {};
        v.productVariantValues?.forEach((pvv: ProductVariantValue) => {
          const optName = pvv.optionValue?.option?.name;
          const optVal = pvv.optionValue?.value || pvv.value;
          if (optName && optVal) optMap[optName] = optVal;
        });

        map.set(v.id, {
          productName: prod.name,
          sku: v.sku || "N/A",
          image: v.images?.[0] || prod.baseImage || "",
          options: optMap,
        });
      });
    });

    return map;
  }, [productsList]);

  const filteredBatches: StockBatch[] = useMemo(() => {
    let list = batches;

    if (statusFilter === "IN_STOCK") {
      list = list.filter((b: StockBatch) => b.quantityRemaining > 0);
    } else if (statusFilter === "SOLD_OUT") {
      list = list.filter((b: StockBatch) => b.quantityRemaining <= 0);
    }

    if (!searchTerm.trim()) return list;
    const q = searchTerm.trim().toLowerCase();

    return list.filter((batch: StockBatch) => {
      const details = variantLookup.get(batch.variantId);
      const nameMatch = details?.productName.toLowerCase().includes(q) || false;
      const skuMatch = details?.sku.toLowerCase().includes(q) || false;
      const batchCodeMatch = (batch.batchNumber || "")
        .toLowerCase()
        .includes(q);
      const variantIdMatch = batch.variantId.toLowerCase().includes(q);
      const noteMatch = (batch.note || "").toLowerCase().includes(q);

      return (
        nameMatch || skuMatch || batchCodeMatch || variantIdMatch || noteMatch
      );
    });
  }, [batches, searchTerm, statusFilter, variantLookup]);

  const inStockBatchesCount: number = useMemo(
    () => batches.filter((b: StockBatch) => b.quantityRemaining > 0)?.length,
    [batches],
  );

  const soldOutBatchesCount: number = useMemo(
    () => batches.filter((b: StockBatch) => b.quantityRemaining <= 0)?.length,
    [batches],
  );

  const handleOpenEdit = (batch: StockBatch) => {
    setSelectedBatch(batch);
    setEditPurchasePrice(batch.purchasePrice);
    setEditSellingPrice(batch.sellingPrice);
    setEditQuantityRemaining(batch.quantityRemaining);
    setEditIsDiscounted(batch.isDiscounted);
    setEditBeforeDiscount(batch.beforeDiscount || undefined);
    setEditNote(batch.note || "");
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBatch) return;

    try {
      await updateBatchMutation.mutateAsync({
        id: selectedBatch.id,
        payload: {
          purchasePrice: Number(editPurchasePrice),
          sellingPrice: Number(editSellingPrice),
          quantityRemaining: Number(editQuantityRemaining),
          isDiscounted: editIsDiscounted,
          beforeDiscount: editIsDiscounted
            ? Number(editBeforeDiscount)
            : undefined,
          note: editNote.trim() || undefined,
        },
      });

      setIsEditOpen(false);
      setSelectedBatch(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBatch) return;

    try {
      await deleteBatchMutation.mutateAsync(selectedBatch.id);
      setIsDeleteOpen(false);
      setSelectedBatch(null);
    } catch (error) {
      console.error(error);
    }
  };

  const statsList: StatCard[] = useMemo(
    () => [
      {
        label: "Total Batches",
        value: totalBatches.toString(),
        badge: "Catalogue",
        bColor: "bg-blue-50 text-blue-600",
      },
      {
        label: "Active In-Stock",
        value: inStockBatchesCount.toString(),
        badge: "Available",
        bColor: "bg-green-50 text-green-600",
      },
      {
        label: "Sold Out Batches",
        value: soldOutBatchesCount.toString(),
        badge: "Exhausted",
        bColor: "bg-red-50 text-red-600",
      },
      {
        label: "Valuation Pipeline",
        value: "FIFO",
        badge: "Live Sync",
        bColor: "bg-purple-50 text-purple-600",
      },
    ],
    [totalBatches, inStockBatchesCount, soldOutBatchesCount],
  );

  const columns: ColumnDef<StockBatch>[] = [
    {
      id: "variantInfo",
      header: createSortableHeader("PRODUCT & VARIANT"),
      cell: ({ row }) => {
        const batch = row.original;
        const details = variantLookup.get(batch.variantId);
        const img =
          details?.image ||
          "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=200";

        return (
          <div className="flex items-center gap-3.5 py-1">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
              {details?.image ? (
                <Image src={img} alt="Variant" fill className="object-cover" />
              ) : (
                <Package size={20} className="text-gray-300" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-gray-900 line-clamp-1">
                {details?.productName || "Product Variant"}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {details?.sku || batch.variantId.slice(0, 10)}
                </span>
                {details?.options &&
                  Object.entries(details.options).map(([opt, val]) => (
                    <Badge
                      key={opt}
                      variant="secondary"
                      className="text-[9px] font-medium py-0 px-1.5 bg-gray-100 text-gray-700 capitalize"
                    >
                      {val}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "batchNumber",
      header: createSortableHeader("BATCH CODE"),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-gray-700">
          {row.original.batchNumber || "STANDARD"}
        </span>
      ),
    },
    {
      accessorKey: "purchasePrice",
      header: createSortableHeader("COST (৳)"),
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-gray-500 font-mono">
          ৳{row.original.purchasePrice.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "sellingPrice",
      header: createSortableHeader("SELLING PRICE (৳)"),
      cell: ({ row }) => {
        const batch = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm text-gray-900 font-mono">
              ৳{batch.sellingPrice.toFixed(2)}
            </span>
            {batch.isDiscounted && batch.beforeDiscount && (
              <span className="text-[10px] text-gray-400 line-through font-mono">
                ৳{batch.beforeDiscount.toFixed(2)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "quantityRemaining",
      header: createSortableHeader("STOCK QUANTITY"),
      cell: ({ row }) => {
        const batch = row.original;
        const percent = Math.round(
          (batch.quantityRemaining / batch.quantityReceived) * 100,
        );

        return (
          <div className="space-y-1 min-w-[130px]">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-900 font-mono">
                {batch.quantityRemaining}
              </span>
              <span className="text-gray-400 font-normal font-mono">
                / {batch.quantityReceived}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  percent > 50
                    ? "bg-green-500"
                    : percent > 15
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const isExhausted = row.original.quantityRemaining <= 0;
        return (
          <Badge
            className={cn(
              "rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border-none",
              isExhausted
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600",
            )}
          >
            {isExhausted ? "Sold Out" : "In Stock"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
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
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem
                className="font-bold text-sm cursor-pointer"
                onClick={() => {
                  setSelectedBatch(row.original);
                  setIsViewOpen(true);
                }}
              >
                <Eye size={14} className="mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm cursor-pointer"
                onClick={() => handleOpenEdit(row.original)}
              >
                <Edit3 size={14} className="mr-2" /> Adjust Stock & Price
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm text-red-500 cursor-pointer"
                onClick={() => {
                  setSelectedBatch(row.original);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 size={14} className="mr-2" /> Delete Batch
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
      className="space-y-8 animate-in fade-in duration-700"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Inventory & Stock (FIFO)
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Real-time batch stock tracking, variant mapping, and price
            adjustments
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 border-gray-200 font-bold text-gray-500 cursor-pointer"
          >
            <Download size={18} className="mr-2" /> Export
          </Button>
          <Button
            onClick={() => router.push("/admin/stocks/create")}
            className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
          >
            <Plus size={20} className="mr-2" /> Add Stock Batch
          </Button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full sm:w-88">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by product, SKU, batch code, or variant..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            { id: "ALL", label: "All Batches" },
            { id: "IN_STOCK", label: "In Stock" },
            { id: "SOLD_OUT", label: "Sold Out" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id as "ALL" | "IN_STOCK" | "SOLD_OUT");
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
              <p className="text-4xl font-black text-gray-900 tracking-tighter font-mono">
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
        data={filteredBatches}
        totalCount={filteredBatches?.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetchingStocks}
        title="Stock Registry"
        className="rounded-[2.5rem] border-none shadow-none bg-transparent"
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-gray-900">
              Adjust Batch Stock & Price
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 font-mono">
              Batch:{" "}
              {selectedBatch?.batchNumber || selectedBatch?.id.slice(0, 10)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs text-gray-700">
                  Cost Price (৳)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPurchasePrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditPurchasePrice(Number(e.target.value))
                  }
                  className="h-11 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-xs text-gray-700">
                  Selling Price (৳)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editSellingPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditSellingPrice(Number(e.target.value))
                  }
                  className="h-11 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs text-gray-700">
                Adjust Remaining Quantity
              </Label>
              <Input
                type="number"
                min="0"
                value={editQuantityRemaining}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditQuantityRemaining(Number(e.target.value))
                }
                className="h-11 rounded-xl font-mono"
              />
            </div>

            <div className="border rounded-xl p-3.5 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs text-gray-900">
                  Discounted Batch
                </Label>
                <Switch
                  checked={editIsDiscounted}
                  onCheckedChange={setEditIsDiscounted}
                />
              </div>

              {editIsDiscounted && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs text-gray-600">
                    Original Price (৳)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1800"
                    value={editBeforeDiscount || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditBeforeDiscount(Number(e.target.value))
                    }
                    className="h-10 rounded-xl bg-white font-mono"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs text-gray-700">
                Batch Notes
              </Label>
              <Textarea
                rows={2}
                placeholder="Reason for adjustment, supplier note..."
                value={editNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditNote(e.target.value)
                }
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateBatchMutation.isPending}
              className="rounded-xl bg-gray-900 text-white cursor-pointer hover:bg-black"
            >
              {updateBatchMutation.isPending ? "Saving..." : "Save Adjustments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Batch Metadata
            </DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Batch Number
                </span>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  {selectedBatch.batchNumber || "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Variant ID
                </span>
                <span className="text-xs font-mono font-bold text-gray-700">
                  {selectedBatch.variantId}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Purchase Cost
                </span>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  ৳{selectedBatch.purchasePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Selling Price
                </span>
                <span className="text-sm font-black text-gray-900 font-mono">
                  ৳{selectedBatch.sellingPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Stock Remaining
                </span>
                <span className="text-sm font-bold text-green-600 font-mono">
                  {selectedBatch.quantityRemaining} /{" "}
                  {selectedBatch.quantityReceived} units
                </span>
              </div>
              {selectedBatch.note && (
                <div className="space-y-1 pt-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Notes
                  </span>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border">
                    {selectedBatch.note}
                  </p>
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
              Delete Stock Batch?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              Only unsold batches can be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteBatchMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6 cursor-pointer"
            >
              {deleteBatchMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
