"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  MoreHorizontal,
  Plus,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import DataTable, {
  createSortableHeader,
  type PaginationParams,
} from "@/components/data-table";
import {
  useCrmCustomers,
  useCreateCrmCustomer,
  useUpdateCrmCustomer,
  useDeleteCrmCustomer,
} from "@/hooks/useCrm";
import { crmCustomerSchema, type CustomerFormValues } from "@/lib/validators";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { useThemeStore } from "@/store/useThemeStore";

interface CustomerTableItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  isRegistered: boolean;
}

const AdminCustomersPage = () => {
  const { primaryColor } = useThemeStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerTableItem | null>(null);

  const dynamicStyles = { "--primary": primaryColor } as CSSProperties;

  const { data: crmResponse, isLoading: isFetchingCrm } = useCrmCustomers(
    currentPage,
    pageSize,
  );
  const createCustomerMutation = useCreateCrmCustomer();
  const updateCustomerMutation = useUpdateCrmCustomer();
  const deleteCustomerMutation = useDeleteCrmCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(crmCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const rawCustomers = useMemo(() => {
    return (
      crmResponse?.data?.customers ||
      (crmResponse as any)?.customers ||
      (crmResponse as any)?.data?.items ||
      []
    );
  }, [crmResponse]);

  const totalCustomers =
    crmResponse?.data?.meta?.totalCustomers ||
    (crmResponse as any)?.meta?.totalCustomers ||
    rawCustomers?.length;

  useEffect(() => {
    if (selectedCustomer && isEditOpen) {
      const customer = rawCustomers.find(
        (c: any) =>
          c._id === selectedCustomer.id || c.id === selectedCustomer.id,
      );
      if (customer) {
        reset({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        });
      }
    }
  }, [selectedCustomer, isEditOpen, reset, rawCustomers]);

  const handlePaginationChange = useCallback((params: PaginationParams) => {
    setCurrentPage(params.page);
    setPageSize(params.pageSize);
  }, []);

  const onCreateSubmit = async (values: CustomerFormValues) => {
    try {
      await createCustomerMutation.mutateAsync(values);
      setIsCreateOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const onEditSubmit = async (values: CustomerFormValues) => {
    if (!selectedCustomer) return;
    try {
      await updateCustomerMutation.mutateAsync({
        id: selectedCustomer.id,
        payload: values,
      });
      setIsEditOpen(false);
      setSelectedCustomer(null);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteCustomerMutation.mutateAsync(selectedCustomer.id);
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error(error);
    }
  };

  const customersData: CustomerTableItem[] = useMemo(() => {
    return rawCustomers.map((cust: any) => ({
      id: cust._id || cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      address: cust.address,
      isRegistered: cust.isRegistered ?? false,
      joinedDate: cust.createdAt
        ? new Date(cust.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recent",
    }));
  }, [rawCustomers]);

  const viewCustomerDetails = selectedCustomer
    ? rawCustomers.find((c: any) => (c._id || c.id) === selectedCustomer.id)
    : null;

  const columns: ColumnDef<CustomerTableItem>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("CUSTOMER NAME"),
      cell: ({ row }) => {
        const initials = row.original.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-4 py-1">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100 rounded-xl">
              <AvatarFallback className="font-bold text-[10px] bg-gray-50 text-gray-400">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                {row.original.name}
                {row.original.isRegistered && (
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                )}
              </p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                Joined {row.original.joinedDate}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: createSortableHeader("EMAIL ADDRESS"),
      cell: ({ row }) => (
        <span className="font-medium text-gray-500">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: createSortableHeader("PHONE NUMBER"),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-gray-700">
          {row.original.phone}
        </span>
      ),
    },
    {
      accessorKey: "isRegistered",
      header: createSortableHeader("MEMBER STATUS"),
      cell: ({ row }) => (
        <Badge
          className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none ${
            row.original.isRegistered
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {row.original.isRegistered ? "Registered" : "Guest Lead"}
        </Badge>
      ),
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
                className="h-8 w-8 text-gray-400"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomer(row.original);
                  setIsViewOpen(true);
                }}
                className="font-bold text-sm"
              >
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomer(row.original);
                  setIsEditOpen(true);
                }}
                className="font-bold text-sm"
              >
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomer(row.original);
                  setIsDeleteOpen(true);
                }}
                className="font-bold text-sm text-red-500"
              >
                Deactivate
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
            Customer Directory
          </h1>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Manage and monitor your global customer base
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 border-gray-200 font-bold text-gray-500"
          >
            <Download size={18} className="mr-2" /> Export CSV
          </Button>

          <Dialog
            open={isCreateOpen}
            onOpenChange={(val) => {
              setIsCreateOpen(val);
              if (!val) reset();
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90">
                <Plus size={20} className="mr-2" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  Add Customer Lead
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                  Register a manual contact inside the CRM
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateSubmit)}
                className="space-y-4 py-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Doe"
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
                  <Label htmlFor="email" className="font-bold text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    className="h-12 rounded-xl border-gray-200"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="e.g., +8801712345678"
                    className="h-12 rounded-xl border-gray-200"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="font-bold text-gray-700">
                    Shipping Address
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter default delivery address..."
                    className="rounded-xl border-gray-200 min-h-[80px]"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white"
                  >
                    {createCustomerMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      "Create Customer"
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
        onOpenChange={(val) => {
          setIsEditOpen(val);
          if (!val) {
            setSelectedCustomer(null);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Edit Customer Lead
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Modify contact details inside CRM
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onEditSubmit)}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-bold text-gray-700">
                Full Name
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., John Doe"
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
              <Label htmlFor="edit-email" className="font-bold text-gray-700">
                Email Address
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="e.g., john@example.com"
                className="h-12 rounded-xl border-gray-200"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs font-bold text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="font-bold text-gray-700">
                Phone Number
              </Label>
              <Input
                id="edit-phone"
                placeholder="e.g., +8801712345678"
                className="h-12 rounded-xl border-gray-200"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs font-bold text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address" className="font-bold text-gray-700">
                Shipping Address
              </Label>
              <Textarea
                id="edit-address"
                placeholder="Enter default delivery address..."
                className="rounded-xl border-gray-200 min-h-[80px]"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-xs font-bold text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={updateCustomerMutation.isPending}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] text-white"
              >
                {updateCustomerMutation.isPending ? (
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
        onOpenChange={(val) => {
          setIsViewOpen(val);
          if (!val) setSelectedCustomer(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Customer Profile
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Full CRM metadata of selected contact
            </DialogDescription>
          </DialogHeader>
          {viewCustomerDetails && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-14 rounded-2xl border-2 border-white shadow-xl bg-blue-50">
                  <AvatarFallback className="font-black text-blue-600 text-xl">
                    {viewCustomerDetails.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-black text-gray-900">
                    {viewCustomerDetails.name}
                  </p>
                  <Badge
                    className={`rounded-full border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-widest mt-1.5 ${
                      viewCustomerDetails.isRegistered
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {viewCustomerDetails.isRegistered
                      ? "Registered Member"
                      : "Guest Lead"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-start gap-4">
                  <Mail className="text-gray-300 mt-0.5" size={16} />
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Email Address
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {viewCustomerDetails.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="text-gray-300 mt-0.5" size={16} />
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Phone Number
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {viewCustomerDetails.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="text-gray-300 mt-0.5" size={16} />
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Shipping Address
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5 leading-relaxed">
                      {viewCustomerDetails.address}
                    </p>
                  </div>
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
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
              This action cannot be undone. This will permanently deactivate and
              delete this customer lead from the CRM directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedCustomer(null)}
              className="rounded-xl font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteCustomerMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6"
            >
              {deleteCustomerMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: "Total Customers",
            value: totalCustomers.toString(),
            trend: "+12%",
            trendUp: true,
          },
          {
            label: "Active Users",
            value: totalCustomers === 0 ? "0" : "1",
            badge: "70%",
            badgeColor: "bg-blue-50 text-blue-600",
          },
          {
            label: "New (30D)",
            value: totalCustomers === 0 ? "0" : "1",
            trend: "+5%",
            trendUp: true,
          },
          {
            label: "Churn Rate",
            value: "2.4%",
            trend: "-0.5%",
            trendUp: false,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[160px] flex flex-col justify-between"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {stat.label}
            </p>
            <div className="flex items-end justify-between mt-4">
              <p className="text-4xl font-black text-gray-900 tracking-tighter">
                {stat.value}
              </p>
              {stat.trend && (
                <Badge
                  className={`rounded-full border-none px-2 py-1 text-[10px] font-bold ${stat.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                >
                  {stat.trendUp ? (
                    <TrendingUp size={10} className="mr-1" />
                  ) : (
                    <TrendingDown size={10} className="mr-1" />
                  )}
                  {stat.trend}
                </Badge>
              )}
              {stat.badge && (
                <Badge
                  className={`rounded-full border-none px-3 py-1 text-[10px] font-bold ${stat.badgeColor}`}
                >
                  <UserCheck size={10} className="mr-1" /> {stat.badge}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </section>

      <DataTable
        columns={columns}
        data={customersData}
        totalCount={totalCustomers}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={isFetchingCrm}
        title="Directory"
        className="rounded-[2.5rem] border-none shadow-none bg-transparent"
      />
    </div>
  );
};

export default AdminCustomersPage;
