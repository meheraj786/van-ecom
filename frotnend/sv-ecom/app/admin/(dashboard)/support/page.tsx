"use client";

import * as React from "react";
import {
  Check,
  CheckCheck,
  Headphones,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  Send,
  User as UserIcon,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService, type ConversationItem } from "@/services/chatService";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

export default function AdminSupportPage() {
  const { primaryColor } = useThemeStore();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = React.useState<string | null>(
    null,
  );
  const [replyText, setReplyText] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { data: rawConversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: () => chatService.getUserConversations("ADMIN"),
    refetchInterval: 4000,
  });

  const conversations: ConversationItem[] = Array.isArray(rawConversations)
    ? rawConversations
    : (rawConversations as any)?.data || [];

  const {
    messages,
    sendMessage,
    sendTyping,
    isTyping,
    isMessagesLoading,
    currentUserId,
  } = useChat(selectedConvId || undefined, "ADMIN");

  const filteredConversations = React.useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase();
    return conversations.filter(
      (c) =>
        c.participants?.some((p) => p.toLowerCase().includes(term)) ||
        c.lastMessage?.toLowerCase().includes(term),
    );
  }, [conversations, searchTerm]);

  React.useEffect(() => {
    if (conversations?.length > 0 && !selectedConvId) {
      const initialId = conversations[0]._id || conversations[0].id || null;
      setSelectedConvId(initialId);
      if (initialId) {
        chatService.markAsRead(initialId, "ADMIN");
      }
    }
  }, [conversations, selectedConvId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (convId: string) => {
    setSelectedConvId(convId);
    chatService.markAsRead(convId, "ADMIN").then(() => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    });
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId) return;
    sendMessage(replyText.trim());
    setReplyText("");
  };

  const selectedConv = conversations.find(
    (c) => (c._id || c.id) === selectedConvId,
  );

  const getParticipantLabel = (conv: ConversationItem) => {
    const target = conv.participants?.find((p) => p !== "ADMIN") || "Customer";
    if (target.startsWith("GUEST_")) {
      const parts = target.split("_");
      const phone = parts[1] || "";
      return {
        title: phone ? `Guest (${phone})` : "Guest Customer",
        isGuest: true,
        identifier: target,
      };
    }
    return {
      title: `Verified Customer (${target.slice(-6).toUpperCase()})`,
      isGuest: false,
      identifier: target,
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
            Customer Support Center
          </h1>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">
            Real-time live chat concierge & ticket resolution
          </p>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm h-[740px] flex overflow-hidden">
        <aside className="w-80 sm:w-96 border-r border-gray-100 flex flex-col bg-white shrink-0">
          <div className="p-5 border-b border-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Inbox Conversations
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] font-mono bg-gray-100 text-gray-700"
              >
                {conversations?.length} Active
              </Badge>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Filter by customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {convsLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin text-gray-300" size={24} />
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400 font-medium">
                No active conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const convId = conv._id || conv.id || "";
                const isSelected = convId === selectedConvId;
                const info = getParticipantLabel(conv);
                const unread = isSelected
                  ? 0
                  : conv.unreadCount?.["ADMIN"] || 0;

                return (
                  <button
                    type="button"
                    key={convId}
                    onClick={() => handleSelectConversation(convId)}
                    className={cn(
                      "w-full p-4.5 flex items-start gap-3.5 text-left transition-all cursor-pointer",
                      isSelected
                        ? "bg-gray-50/90 border-l-4 border-gray-900"
                        : "hover:bg-gray-50/50",
                    )}
                  >
                    <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs uppercase shrink-0">
                      {info.isGuest ? (
                        <Phone size={14} />
                      ) : (
                        <UserIcon size={16} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-xs text-gray-900 truncate">
                          {info.title}
                        </p>
                        {info.isGuest ? (
                          <Badge
                            variant="secondary"
                            className="text-[8px] font-mono py-0 px-1 bg-amber-50 text-amber-700 border-amber-200"
                          >
                            Guest
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[8px] font-mono py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-gray-500 truncate leading-snug">
                          {conv.lastMessage || "Started a new conversation"}
                        </p>
                        {unread > 0 && (
                          <span className="h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-[#fafafa]">
          {selectedConvId ? (
            <>
              <div className="bg-white p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">
                      {selectedConv
                        ? getParticipantLabel(selectedConv).title
                        : "Customer"}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Session Reference: {selectedConvId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Live Connected
                  </Badge>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-3.5">
                {isMessagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-300" size={26} />
                  </div>
                ) : messages?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-gray-400 space-y-2">
                    <MessageSquare size={32} className="text-gray-300" />
                    <p>No messages exchanged in this conversation yet.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe =
                      msg.senderRole === "ADMIN" ||
                      msg.senderRole === "STAFF" ||
                      msg.senderId === currentUserId;

                    const time = new Date(msg.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );

                    return (
                      <div
                        key={msg._id || msg.id || idx}
                        className={cn(
                          "flex flex-col",
                          isMe ? "items-end" : "items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm",
                            isMe
                              ? "bg-gray-900 text-white rounded-br-xs"
                              : "bg-white text-gray-900 border border-gray-100 rounded-bl-xs",
                          )}
                        >
                          <p className="font-semibold text-[10px] opacity-70 mb-1">
                            {msg.senderName} ({msg.senderRole})
                          </p>
                          <p>{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[9px] text-gray-400 font-mono">
                            {time}
                          </span>
                          {isMe && (
                            <span className="text-gray-400">
                              {msg.readBy && msg.readBy?.length > 1 ? (
                                <CheckCheck
                                  size={11}
                                  className="text-blue-500"
                                />
                              ) : (
                                <Check size={11} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="text-gray-400 text-xs italic flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Customer is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendReply}
                className="p-4 bg-white border-t border-gray-100 flex items-center gap-3"
              >
                <Input
                  placeholder="Type a response to the customer..."
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    sendTyping(true);
                  }}
                  className="h-12 rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white"
                />
                <Button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="h-12 px-6 rounded-xl bg-gray-900 text-white hover:bg-gray-800 font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  <Send size={14} className="mr-2" /> Send
                </Button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="h-16 w-16 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
                <Headphones size={28} />
              </div>
              <h3 className="font-bold text-sm text-gray-800">
                No active conversation selected
              </h3>
              <p className="text-xs text-gray-400 max-w-xs">
                Select a customer from the left sidebar to start live chatting
                and resolving tickets.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
