"use client";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type HeaderContext,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react";
import * as React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BackendPaginatedResponse<TData> {
  items: TData[];
  totalCount: number;
  currentPage: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  currentPage: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPaginationChange: (params: PaginationParams) => void;
  title?: string;
  searchPlaceholder?: string;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enablePagination?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  currentPage,
  pageSize = 10,
  pageSizeOptions = [10, 20, 25, 30, 40, 50, 100, 200, 500, 1000],
  onPaginationChange,
  title,
  searchPlaceholder = "Search...",
  enableColumnVisibility = true,
  enableExport = true,
  enablePagination = true,
  loading = false,
  emptyMessage = "No results found.",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [internalPageSize, setInternalPageSize] = React.useState(pageSize);

  const pageCount = Math.ceil(totalCount / internalPageSize);

  const skeletonIds = React.useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => `skeleton-${index}`);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    const sortItem = sorting[0];
    onPaginationChange({
      page: 1,
      pageSize: internalPageSize,
      search: debouncedSearch || undefined,
      sortBy: sortItem?.id,
      sortOrder: sortItem ? (sortItem.desc ? "desc" : "asc") : undefined,
    });
  }, [debouncedSearch, sorting, internalPageSize, onPaginationChange]);

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: internalPageSize,
      },
    },
  });

  const goToPage = (page: number) => {
    const sortItem = sorting[0];
    onPaginationChange({
      page,
      pageSize: internalPageSize,
      search: debouncedSearch || undefined,
      sortBy: sortItem?.id,
      sortOrder: sortItem ? (sortItem.desc ? "desc" : "asc") : undefined,
    });
  };

  const handlePageSizeChange = (newSize: number) => {
    setInternalPageSize(newSize);
    const sortItem = sorting[0];
    onPaginationChange({
      page: 1,
      pageSize: newSize,
      search: debouncedSearch || undefined,
      sortBy: sortItem?.id,
      sortOrder: sortItem ? (sortItem.desc ? "desc" : "asc") : undefined,
    });
  };

  const getExportData = () => {
    const headers = table.getVisibleFlatColumns().map((col) => col.id);
    const rows = data.map((row) =>
      headers.map((header) => {
        const value = (row as Record<string, unknown>)[header];
        return typeof value === "string" || typeof value === "number"
          ? value
          : "";
      }),
    );
    return { headers, rows };
  };

  const exportToCSV = () => {
    const { headers, rows } = getExportData();
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `${title || "data"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXLSX = () => {
    const { headers, rows } = getExportData();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${title || "data"}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    if (title) {
      doc.setFontSize(14);
      doc.text(title, 14, 20);
    }
    const formatColumnName = (id: string) =>
      id
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const visibleCols = table
      .getVisibleFlatColumns()
      .filter((c) => c.id.toLowerCase() !== "actions");

    const headers = visibleCols.map((c) => formatColumnName(c.id));
    const rows = data.map((row) =>
      visibleCols.map((col) => {
        const value = (row as Record<string, unknown>)[col.id];
        return typeof value === "string" || typeof value === "number"
          ? String(value).replace(/৳/g, "TK ")
          : "";
      }),
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: title ? 30 : 15,
      theme: "striped",
      styles: { fontSize: 7, cellPadding: 2.5, textColor: [30, 30, 30] },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 15, left: 10, right: 10 },
    });

    doc.save(`${title || "data"}.pdf`);
  };

  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {skeletonIds.map((skeletonId) => (
              <div
                key={skeletonId}
                className="h-8 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {enableExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToXLSX}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as XLSX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize"
                        checked={col.getIsVisible()}
                        onCheckedChange={(value) =>
                          col.toggleVisibility(!!value)
                        }
                      >
                        {col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="border">
          <div className="overflow-x-auto">
            <Table className="border-collapse min-w-max">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="bg-primary text-primary-foreground border-r font-semibold min-w-[150px] whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-muted/30"
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="border-r whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns?.length}
                      className="h-24 text-center"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {enablePagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t flex-wrap gap-2">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium">
                {Math.min((currentPage - 1) * internalPageSize + 1, totalCount)}
              </span>{" "}
              –{" "}
              <span className="font-medium">
                {Math.min(currentPage * internalPageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span> results
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <Select
                  value={`${internalPageSize}`}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={internalPageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                  let page: number;
                  if (pageCount <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= pageCount - 2) {
                    page = pageCount - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pageCount)}
                  disabled={currentPage === pageCount}
                >
                  »
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function createSortableHeader<TData, TValue>(title: string) {
  const SortableHeader = (props: HeaderContext<TData, TValue>) => (
    <Button
      variant="ghost"
      onClick={() =>
        props.column.toggleSorting(props.column.getIsSorted() === "asc")
      }
      className="h-auto p-0 font-medium text-xs hover:bg-transparent hover:text-primary-foreground/80"
    >
      {title}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );
  SortableHeader.displayName = "SortableHeader";
  return SortableHeader;
}
