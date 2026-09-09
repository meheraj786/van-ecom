"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Info,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Truck,
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
import { useForm } from "react-hook-form";
import * as z from "zod";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import {
  useDivisions,
  useCreateDivision,
  useUpdateDivision,
  useDeleteDivision,
} from "@/hooks/useDivisions";
import {
  divisionSchema,
  type DivisionFormInput,
  type DivisionFormValues,
} from "@/lib/validators";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/store/useThemeStore";
import type { Division } from "@/services/divisionService";

interface DivisionResponse {
  data?: Division[];
  items?: Division[];
  divisions?: Division[];
}

interface StatCard {
  label: string;
  value: string;
  badge: string | null;
  bColor?: string;
}

const AdminDivisionsPage = () => {
  const { primaryColor } = useThemeStore();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(
    null,
  );

  const { data: divisionsResponse, isLoading: isFetching } = useDivisions();
  const createDivisionMutation = useCreateDivision();
  const updateDivisionMutation = useUpdateDivision();
  const deleteDivisionMutation = useDeleteDivision();

  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const rawDivisionsList: Division[] = useMemo(() => {
    if (Array.isArray(divisionsResponse)) {
      return divisionsResponse;
    }
    const res = divisionsResponse as DivisionResponse | undefined;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.divisions)) return res.divisions;
    return [];
  }, [divisionsResponse]);

  const filteredDivisions: Division[] = useMemo(() => {
    if (!searchTerm.trim()) return rawDivisionsList;
    const q = searchTerm.trim().toLowerCase();
    return rawDivisionsList.filter(
      (d: Division) =>
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.deliveryCharge.toString().includes(q),
    );
  }, [rawDivisionsList, searchTerm]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DivisionFormInput, unknown, DivisionFormValues>({
    resolver: zodResolver(divisionSchema),
    defaultValues: {
      name: "",
      deliveryCharge: 0,
    },
  });

  useEffect(() => {
    if (selectedDivision && isEditOpen) {
      reset({
        name: selectedDivision.name,
        deliveryCharge: selectedDivision.deliveryCharge,
      });
    }
  }, [selectedDivision, isEditOpen, reset]);

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
  }, []);

  const onCreateSubmit = async (values: DivisionFormValues) => {
    try {
      await createDivisionMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const onEditSubmit = async (values: DivisionFormValues) => {
    if (!selectedDivision) return;
    try {
      await updateDivisionMutation.mutateAsync({
        id: selectedDivision.id,
        payload: values,
      });
      setIsEditOpen(false);
      setSelectedDivision(null);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDivision) return;
    try {
      await deleteDivisionMutation.mutateAsync(selectedDivision.id);
      setIsDeleteOpen(false);
      setSelectedDivision(null);
    } catch (error) {
      console.error(error);
    }
  };

  const totalDivisions = rawDivisionsList?.length;
  const avgDeliveryCharge: string = useMemo(() => {
    if (totalDivisions === 0) return "0.00";
    const total = rawDivisionsList.reduce(
      (acc: number, curr: Division) => acc + (Number(curr.deliveryCharge) || 0),
      0,
    );
    return (total / totalDivisions).toFixed(2);
  }, [rawDivisionsList, totalDivisions]);

  const paginatedData: Division[] = useMemo(() => {
    return filteredDivisions.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
  }, [filteredDivisions, currentPage, pageSize]);

  const statsList: StatCard[] = useMemo(
    () => [
      {
        label: "Total Divisions",
        value: totalDivisions.toString(),
        badge: "Active",
        bColor: "bg-green-50 text-green-600",
      },
      {
        label: "Avg. Delivery Fee",
        value: `৳${avgDeliveryCharge}`,
        badge: null,
      },
      {
        label: "Shipping Coverage",
        value: "100%",
        badge: "Optimal",
        bColor: "bg-blue-50 text-blue-600",
      },
    ],
    [totalDivisions, avgDeliveryCharge],
  );

  const columns: ColumnDef<Division>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("DIVISION NAME"),
      cell: ({ row }) => (
        <div className="flex items-center gap-4 py-1">
          <div className="relative h-10 w-10 rounded-xl border bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
            <MapPin size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{row.original.name}</p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5 font-mono">
              ID: {row.original.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "deliveryCharge",
      header: createSortableHeader("DELIVERY CHARGE"),
      cell: ({ row }) => (
        <span className="font-mono font-black text-gray-900">
          ৳{Number(row.original.deliveryCharge || 0).toFixed(2)}
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
                  setSelectedDivision(row.original);
                  setIsEditOpen(true);
                }}
              >
                Edit Division
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm cursor-pointer"
                onClick={() => {
                  setSelectedDivision(row.original);
                  setIsViewOpen(true);
                }}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-bold text-sm text-red-500 cursor-pointer"
                onClick={() => {
                  setSelectedDivision(row.original);
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

  return (
    <div
      style={dynamicStyles}
      className="space-y-10 animate-in fade-in duration-700"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Divisions &amp; Shipping
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Manage regional shipping rates and delivery charges
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog
            open={isCreateOpen}
            onOpenChange={(val: boolean) => {
              setIsCreateOpen(val);
              if (!val) reset();
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer">
                <Plus size={20} className="mr-2" /> Add Division
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  Add New Division
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                  Configure delivery rates for a specific region
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateSubmit)}
                className="space-y-6 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-gray-700">
                    Division Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Dhaka, Chattogram"
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
                  <Label
                    htmlFor="deliveryCharge"
                    className="font-bold text-gray-700"
                  >
                    Delivery Charge (৳)
                  </Label>
                  <Input
                    id="deliveryCharge"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 60.00"
                    className="h-12 rounded-xl border-gray-200 font-mono"
                    {...register("deliveryCharge")}
                  />
                  {errors.deliveryCharge && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.deliveryCharge.message}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createDivisionMutation.isPending}
                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
                  >
                    {createDivisionMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      "Create Division"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="relative w-full sm:w-88">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by division name or charge..."
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
      </div>

      <Dialog
        open={isEditOpen}
        onOpenChange={(val: boolean) => {
          setIsEditOpen(val);
          if (!val) {
            setSelectedDivision(null);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Edit Division
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Modify regional delivery rates
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="space-y-6 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-bold text-gray-700">
                Division Name
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Dhaka"
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
              <Label
                htmlFor="edit-deliveryCharge"
                className="font-bold text-gray-700"
              >
                Delivery Charge (৳)
              </Label>
              <Input
                id="edit-deliveryCharge"
                type="number"
                step="0.01"
                placeholder="e.g., 60.00"
                className="h-12 rounded-xl border-gray-200 font-mono"
                {...register("deliveryCharge")}
              />
              {errors.deliveryCharge && (
                <p className="text-xs font-bold text-red-500">
                  {errors.deliveryCharge.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={updateDivisionMutation.isPending}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 cursor-pointer"
              >
                {updateDivisionMutation.isPending ? (
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
          if (!val) setSelectedDivision(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Division Details
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Full rate configuration of selected region
            </DialogDescription>
          </DialogHeader>
          {selectedDivision && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  ID
                </span>
                <span className="text-sm font-black text-gray-900 font-mono">
                  {selectedDivision.id}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Name
                </span>
                <span className="text-sm font-black text-gray-900">
                  {selectedDivision.name}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Delivery Charge
                </span>
                <span className="text-sm font-black text-gray-900 font-mono">
                  ৳{Number(selectedDivision.deliveryCharge || 0).toFixed(2)}
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
              division and its shipping rate configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedDivision(null)}
              className="rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteDivisionMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6 cursor-pointer"
            >
              {deleteDivisionMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        data={paginatedData}
        totalCount={filteredDivisions?.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetching}
        title="Delivery Divisions"
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
                Shipping Tip
              </h3>
            </div>
            <p className="text-white/80 max-w-lg font-medium leading-relaxed">
              Delivery charges set here are automatically applied during
              customer checkout based on their selected delivery division.
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="xl:col-span-2 p-10 rounded-[3rem] bg-gray-100 border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-[1.5rem] shadow-sm text-gray-400">
              <Truck size={24} />
            </div>
            <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase">
              Logistics
            </h4>
          </div>
          <p className="text-sm text-gray-500 font-medium leading-relaxed italic mt-6">
            Make sure delivery rates are kept up-to-date with your courier
            partners.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDivisionsPage;
