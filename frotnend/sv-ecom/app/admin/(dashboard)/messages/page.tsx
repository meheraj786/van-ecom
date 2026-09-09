"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  Phone,
  RefreshCw,
  Reply,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { api as apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface ContactMessageItem {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  status?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "ALL" | "UNREAD" | "READ"
  >("ALL");

  const [selectedMessage, setSelectedMessage] =
    React.useState<ContactMessageItem | null>(null);
  const [messageToDelete, setMessageToDelete] = React.useState<string | null>(
    null,
  );

  const {
    data: messagesResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-contact-messages", page, limit, statusFilter],
    queryFn: async () => {
      let url = `/contact-message?page=${page}&limit=${limit}`;
      if (statusFilter === "UNREAD") url += "&isRead=false";
      if (statusFilter === "READ") url += "&isRead=true";

      const res = await apiClient.get(url);
      return res.data;
    },
  });

  const rawMessages: ContactMessageItem[] = messagesResponse?.data?.items || [];
  const totalMessages: number =
    messagesResponse?.data?.total || messagesResponse?.total || 0;
  const totalPages: number =
    messagesResponse?.data?.totalPages || messagesResponse?.totalPages || 1;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/contact-message/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/contact-message/${id}`);
      return res.data;
    },
    onSuccess: () => {
      setMessageToDelete(null);
      if (
        selectedMessage &&
        (selectedMessage.id === messageToDelete ||
          selectedMessage._id === messageToDelete)
      ) {
        setSelectedMessage(null);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    },
  });

  const handleOpenMessage = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    const msgId = msg.id || msg._id;
    if (!msg.isRead && msgId) {
      markAsReadMutation.mutate(msgId);
    }
  };

  const filteredMessages = React.useMemo(() => {
    if (!searchTerm.trim()) return rawMessages;
    const q = searchTerm.toLowerCase();
    return rawMessages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    );
  }, [rawMessages, searchTerm]);

  const unreadCount = React.useMemo(() => {
    return rawMessages.filter((m) => !m.isRead)?.length;
  }, [rawMessages]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 -m-6 md:-m-10 p-6 md:p-10 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="h-11 w-11 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Customer Inquiries &amp; Messages
              </h1>
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full border-none">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              View and respond to inquiries submitted via the Contact Us form
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-10 rounded-xl border-gray-200 text-xs font-semibold gap-1.5 ml-auto sm:ml-0"
          >
            <RefreshCw
              size={14}
              className={cn(isRefetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Total Inquiries
            </span>
            <p className="text-2xl font-black text-gray-900">{totalMessages}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <Inbox size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
              Unread Messages
            </span>
            <p className="text-2xl font-black text-blue-600">{unreadCount}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
              Replied / Read
            </span>
            <p className="text-2xl font-black text-emerald-600">
              {Math.max(0, totalMessages - unreadCount)}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MailOpen size={22} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Search sender, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl text-xs bg-gray-50 border-gray-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-400 mr-1 hidden sm:inline">
              Filter:
            </span>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
              {[
                { id: "ALL", label: "All" },
                { id: "UNREAD", label: "Unread" },
                { id: "READ", label: "Read" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as "ALL" | "UNREAD" | "READ");
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    statusFilter === tab.id
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={30} className="animate-spin text-gray-300" />
            <p className="text-xs text-gray-400 font-medium">
              Loading inquiries...
            </p>
          </div>
        ) : filteredMessages?.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <MailOpen size={30} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">
              No Messages Found
            </h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              No customer inquiries match your current filter or search
              criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">Sender Details</th>
                  <th className="py-3.5 px-6">Subject / Inquiry</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Received At</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredMessages.map((msg) => {
                  const msgId = msg.id || msg._id || "";
                  const isUnread = !msg.isRead;
                  const dateFormatted = new Date(
                    msg.createdAt,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={msgId}
                      onClick={() => handleOpenMessage(msg)}
                      className={cn(
                        "hover:bg-gray-50/80 transition-colors cursor-pointer group",
                        isUnread && "bg-blue-50/30 font-medium",
                      )}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                              isUnread
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600",
                            )}
                          >
                            {msg.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">
                              {msg.name}
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                              {msg.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-md">
                        <p className="font-bold text-gray-900 truncate">
                          {msg.subject || "(No Subject)"}
                        </p>
                        <p className="text-gray-500 text-[11px] truncate mt-0.5">
                          {msg.message}
                        </p>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {isUnread ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-bold text-[10px] px-2 py-0.5">
                            Unread
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 border-none font-medium text-[10px] px-2 py-0.5"
                          >
                            Read
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-gray-500 text-[11px] font-mono">
                        {dateFormatted}
                      </td>

                      <td
                        className="py-4 px-6 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenMessage(msg)}
                            className="h-8 w-8 p-0 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            title="View Message Details"
                          >
                            <Eye size={15} />
                          </Button>

                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                              msg.subject || "Your Inquiry at Lumina",
                            )}`}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Reply via Email"
                          >
                            <Reply size={15} />
                          </a>

                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMessageToDelete(msgId)}
                            className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Message"
                          >
                            <Trash2 size={15} />
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {page} of {totalPages} ({totalMessages} items)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 rounded-lg text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 rounded-lg text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(selectedMessage)}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8 space-y-6">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {selectedMessage?.subject || "Customer Inquiry"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 font-mono mt-1">
                  Received on{" "}
                  {selectedMessage?.createdAt
                    ? new Date(selectedMessage.createdAt).toLocaleString()
                    : ""}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Sender Name
                  </span>
                  <p className="font-bold text-gray-900">
                    {selectedMessage.name}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="font-bold text-blue-600 hover:underline font-mono"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                {selectedMessage.phone && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="font-bold text-gray-900 font-mono"
                    >
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  Message Content
                </span>
                <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject || "Your Inquiry at Lumina",
                    )}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black font-bold text-xs transition-all"
                  >
                    <Mail size={14} /> Reply via Email
                  </a>

                  {selectedMessage.phone && (
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] font-bold text-xs transition-all"
                    >
                      <FaWhatsapp size={15} /> WhatsApp
                    </a>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-xl text-xs font-semibold h-10 px-5 ml-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(messageToDelete)}
        onOpenChange={(open) => !open && setMessageToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Delete Contact Message?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500">
              This action cannot be undone. This message will be permanently
              removed from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMessageMutation.isPending}
              onClick={() =>
                messageToDelete && deleteMessageMutation.mutate(messageToDelete)
              }
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              {deleteMessageMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
