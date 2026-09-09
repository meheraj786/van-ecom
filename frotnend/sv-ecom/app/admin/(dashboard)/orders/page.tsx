"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Eye,
  MoreHorizontal,
  Phone,
  CreditCard,
  Truck,
  Search,
  X,
} from "lucide-react";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import { useOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

interface BillingInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

interface OrderItem {
  id?: string;
  productId: string;
  variantId: string;
  name?: string;
  quantity: number;
  price: number;
  image?: string;
  sku?: string;
  options?: Record<string, string>;
}

export interface Order {
  id: string;
  _id?: string;
  userId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string | null;
  billing?: BillingInfo;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const { primaryColor } = useThemeStore();
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const dynamicStyles = { "--primary": primaryColor } as React.CSSProperties;

  const { data: ordersResponse, isLoading } = useOrders({
    page: currentPage,
    limit: pageSize,
  });

  const handlePaginationChange = React.useCallback(
    (params: PaginationParams) => {
      setCurrentPage(params.page);
      setPageSize(params.pageSize);
    },
    [],
  );

  const ordersData: any = React.useMemo(() => {
    return (
      ordersResponse?.orders || (ordersResponse as any)?.data?.orders || []
    );
  }, [ordersResponse]);

  const totalOrders: number = React.useMemo(() => {
    const meta = ordersResponse?.meta;
    if (typeof meta?.totalOrders === "number") return meta.totalOrders;
    return ordersData?.length;
  }, [ordersResponse, ordersData]);

  const filteredOrders: Order[] = React.useMemo(() => {
    let list = ordersData;

    if (statusFilter !== "ALL") {
      list = list.filter(
        (o: Order) =>
          o.status?.toUpperCase() === statusFilter ||
          o.paymentStatus?.toUpperCase() === statusFilter,
      );
    }

    if (!searchTerm.trim()) return list;
    const q = searchTerm.trim().toLowerCase();

    return list.filter((order: Order) => {
      const idMatch =
        order.id.toLowerCase().includes(q) ||
        `#ord-${order.id.slice(-6)}`.toLowerCase().includes(q) ||
        (order.transactionId && order.transactionId.toLowerCase().includes(q));

      const nameMatch = (order.customerName || order.billing?.fullName || "")
        .toLowerCase()
        .includes(q);

      const phoneMatch = (order.customerPhone || order.billing?.phone || "")
        .toLowerCase()
        .includes(q);

      const emailMatch = (order.customerEmail || order.billing?.email || "")
        .toLowerCase()
        .includes(q);

      const statusMatch = order.status?.toLowerCase().includes(q);
      const paymentMatch = order.paymentMethod?.toLowerCase().includes(q);

      return (
        idMatch ||
        nameMatch ||
        phoneMatch ||
        emailMatch ||
        statusMatch ||
        paymentMatch
      );
    });
  }, [ordersData, searchTerm, statusFilter]);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: createSortableHeader("ORDER ID"),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Link href={`/admin/orders/${order.id}`}>
            <span className="font-mono font-bold text-gray-900 hover:text-[var(--primary)] cursor-pointer">
              #ORD-{order.id.slice(-6).toUpperCase()}
            </span>
          </Link>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("DATE"),
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs font-medium font-mono">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: createSortableHeader("RECIPIENT"),
      cell: ({ row }) => {
        const order = row.original;
        const name =
          order.customerName || order.billing?.fullName || "Guest Customer";
        const phone = order.customerPhone || order.billing?.phone || "N/A";

        return (
          <div className="py-1">
            <p className="font-bold text-sm text-gray-900 leading-snug">
              {name}
            </p>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
              <Phone size={10} /> {phone}
            </p>
          </div>
        );
      },
    },
    {
      id: "payment",
      header: "PAYMENT",
      cell: ({ row }) => {
        const order = row.original;
        const method = order.paymentMethod || "COD";
        const pStatus = order.paymentStatus || "UNPAID";

        const pVariants: Record<string, string> = {
          PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
          PENDING: "bg-amber-50 text-amber-700 border-amber-200",
          UNPAID: "bg-gray-50 text-gray-700 border-gray-200",
          FAILED: "bg-red-50 text-red-700 border-red-200",
          CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
        };

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              {method === "SSLCOMMERZ" ? (
                <CreditCard size={13} className="text-blue-600" />
              ) : (
                <Truck size={13} className="text-gray-600" />
              )}
              <span>{method === "SSLCOMMERZ" ? "Online (SSL)" : "COD"}</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0 text-[9px] font-black uppercase tracking-wider rounded-md border",
                pVariants[pStatus] ||
                  "bg-gray-50 text-gray-600 border-gray-200",
              )}
            >
              {pStatus}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: createSortableHeader("TOTAL AMOUNT"),
      cell: ({ row }) => (
        <span className="font-black text-gray-900">
          ৳{Number(row.original.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: createSortableHeader("ORDER STATUS"),
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, string> = {
          PAID: "bg-green-50 text-green-600 border-green-100",
          PENDING: "bg-amber-50 text-amber-600 border-amber-100",
          PROCESSING: "bg-blue-50 text-blue-600 border-blue-100",
          SHIPPED: "bg-indigo-50 text-indigo-600 border-indigo-100",
          DELIVERED: "bg-purple-50 text-purple-600 border-purple-100",
          CANCELLED: "bg-red-50 text-red-600 border-red-100",
        };

        return (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider border",
              variants[status] || "bg-gray-50 text-gray-600 border-gray-200",
            )}
          >
            {status}
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
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-400">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/orders/${row.original.id}`)}
                className="font-bold text-sm cursor-pointer"
              >
                <Eye size={14} className="mr-2" /> View Details
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
            Orders
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Manage customer sales, shipments, and delivery status
          </p>
        </div>
        <Button
          variant="outline"
          className="h-12 rounded-xl px-6 border-gray-200 font-bold text-gray-500 cursor-pointer"
        >
          <Download size={18} className="mr-2" /> Export
        </Button>
      </header>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full sm:w-88">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by order ID, name, phone, or status..."
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
            { id: "ALL", label: "All" },
            { id: "PENDING", label: "Pending" },
            { id: "PAID", label: "Paid" },
            { id: "PROCESSING", label: "Processing" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
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

      <DataTable
        columns={columns}
        data={filteredOrders}
        totalCount={filteredOrders?.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isLoading}
        title="Sales Orders"
        className="rounded-[2.5rem] border-none shadow-none bg-transparent"
      />
    </div>
  );
}
