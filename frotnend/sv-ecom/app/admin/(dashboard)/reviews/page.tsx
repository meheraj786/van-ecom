"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  ExternalLink,
  Info,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Star,
  Trash2,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useCallback, useState, useMemo } from "react";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import { useAdminReviews, useDeleteProductReview } from "@/hooks/useReviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useThemeStore } from "@/store/useThemeStore";

interface ReviewTableRow {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const AdminReviewsPage = () => {
  const { primaryColor } = useThemeStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewTableRow | null>(
    null,
  );

  const { data: reviewsResponse, isLoading: isFetching } = useAdminReviews(
    currentPage,
    pageSize,
  );
  const deleteReviewMutation = useDeleteProductReview();

  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const rawReviews = useMemo(() => {
    return reviewsResponse?.reviews || [];
  }, [reviewsResponse]);

  const totalReviews = reviewsResponse?.meta?.totalReviews || 0;

  const reviewsData: ReviewTableRow[] = useMemo(() => {
    return rawReviews.map((rev: any) => ({
      id: rev.id,
      productId: rev.productId,
      productName: rev.product?.name || "Product Item",
      productSlug: rev.product?.slug || "",
      productImage:
        rev.product?.baseImage ||
        "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=200",
      userName: rev.userName || "Verified Customer",
      rating: rev.rating || 5,
      comment: rev.comment || "",
      createdAt: rev.createdAt,
    }));
  }, [rawReviews]);

  const averageRatingScore = useMemo(() => {
    if (!reviewsData?.length) return "5.0";
    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviewsData?.length).toFixed(1);
  }, [reviewsData]);

  const fiveStarReviewsCount = useMemo(() => {
    return reviewsData.filter((r) => r.rating === 5)?.length;
  }, [reviewsData]);

  const criticalReviewsCount = useMemo(() => {
    return reviewsData.filter((r) => r.rating <= 2)?.length;
  }, [reviewsData]);

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;
    try {
      await deleteReviewMutation.mutateAsync(selectedReview.id);
      setIsDeleteOpen(false);
      setSelectedReview(null);
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ColumnDef<ReviewTableRow>[] = [
    {
      accessorKey: "productName",
      header: createSortableHeader("PRODUCT"),
      cell: ({ row }) => {
        const rev = row.original;
        return (
          <div className="flex items-center gap-4 py-1">
            <div className="relative h-12 w-12 rounded-xl border bg-gray-50 overflow-hidden shrink-0">
              <Image
                src={rev.productImage}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 max-w-[220px]">
              <Link
                href={`/shop/product/${rev.productSlug}`}
                target="_blank"
                className="font-bold text-sm text-gray-900 hover:text-blue-600 truncate block transition-colors"
              >
                {rev.productName}
              </Link>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                ID: {rev.productId?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "userName",
      header: createSortableHeader("CUSTOMER"),
      cell: ({ row }) => {
        const rev = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs uppercase shrink-0">
              {rev.userName ? rev.userName[0] : <UserIcon size={14} />}
            </div>
            <span className="font-bold text-xs text-gray-900">
              {rev.userName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: createSortableHeader("RATING"),
      cell: ({ row }) => {
        const rating = row.original.rating;
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={
                    s <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="font-bold text-xs text-gray-900 ml-1">
              {rating}.0
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "comment",
      header: "FEEDBACK",
      cell: ({ row }) => (
        <p className="text-xs text-gray-600 max-w-sm line-clamp-2">
          {row.original.comment || "—"}
        </p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("DATE"),
      cell: ({ row }) => (
        <span className="text-xs font-mono font-medium text-gray-400">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
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
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem
                className="font-bold text-xs cursor-pointer"
                onClick={() => {
                  setSelectedReview(row.original);
                  setIsViewOpen(true);
                }}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-xs cursor-pointer"
                asChild
              >
                <Link
                  href={`/products/${row.original.productSlug}`}
                  target="_blank"
                  className="flex items-center justify-between"
                >
                  <span>View Product</span>
                  <ExternalLink size={12} />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-xs text-red-500 cursor-pointer"
                onClick={() => {
                  setSelectedReview(row.original);
                  setIsDeleteOpen(true);
                }}
              >
                Delete Review
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
            Reviews
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Customer feedback & satisfaction rating management
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 border-gray-200 font-bold text-gray-500"
          >
            <Download size={18} className="mr-2" /> Export
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: "Total Reviews",
            value: totalReviews.toString(),
            badge: "All Time",
            bColor: "bg-blue-50 text-blue-600",
          },
          {
            label: "Average Rating",
            value: `${averageRatingScore} ★`,
            badge: "Score",
            bColor: "bg-amber-50 text-amber-600",
          },
          {
            label: "5-Star Ratings",
            value: fiveStarReviewsCount.toString(),
            badge: "Positive",
            bColor: "bg-green-50 text-green-600",
          },
          {
            label: "Critical Reviews",
            value: criticalReviewsCount.toString(),
            badge: criticalReviewsCount > 0 ? "Attention" : "None",
            bColor:
              criticalReviewsCount > 0
                ? "bg-red-50 text-red-600"
                : "bg-gray-50 text-gray-400",
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
        data={reviewsData}
        totalCount={totalReviews}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetching}
        title="Customer Ratings & Reviews"
        className="rounded-[2.5rem] border-none shadow-none bg-transparent"
      />

      <Dialog
        open={isViewOpen}
        onOpenChange={(val) => {
          setIsViewOpen(val);
          if (!val) setSelectedReview(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Review Breakdown
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Full detail of customer feedback
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-5 py-4">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="relative h-16 w-16 rounded-xl border bg-white overflow-hidden shrink-0">
                  <Image
                    src={selectedReview.productImage}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-gray-900 leading-snug">
                    {selectedReview.productName}
                  </h4>
                  <p className="text-xs font-mono text-gray-400">
                    Product ID: {selectedReview.productId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Customer
                  </span>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedReview.userName}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Rating Score
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= selectedReview.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-900 ml-1">
                      ({selectedReview.rating}/5)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Date Submitted
                </span>
                <p className="text-xs font-mono font-medium text-gray-700">
                  {new Date(selectedReview.createdAt).toLocaleString("en-US")}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Customer Comment
                </span>
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-700 leading-relaxed italic">
                  "{selectedReview.comment || "No detailed comment provided."}"
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
              Delete Customer Review?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
              This action cannot be undone. This review will be removed
              permanently, and the product average rating will be recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedReview(null)}
              className="rounded-xl font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteReviewMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6 cursor-pointer"
            >
              {deleteReviewMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 p-10 rounded-[3rem] bg-[var(--primary)] text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Info size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase">
                Review Moderation Guide
              </h3>
            </div>
            <p className="text-white/80 max-w-lg font-medium leading-relaxed">
              Customer reviews impact overall product trust. Only delete reviews
              that violate content guidelines or contain spam/inappropriate
              behavior.
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
              Customer Sentiment
            </h4>
          </div>
          <p className="text-sm text-gray-500 font-medium leading-relaxed italic mt-6">
            Overall average store rating is{" "}
            <span className="text-green-600 font-black">
              {averageRatingScore} / 5.0
            </span>{" "}
            across all live customer reviews.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
