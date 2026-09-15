import { api } from "@/lib/api";

export interface MessageItem {
  id?: string;
  _id?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "USER" | "VENDOR" | "ADMIN" | "STAFF";
  content: string;
  attachments?: string[];
  readBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationItem {
  id?: string;
  _id?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  unreadCount?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessagesResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  messages: MessageItem[];
}

export const chatService = {
  async getOrCreateConversation(
    targetUserId = "ADMIN",
    senderId?: string,
  ): Promise<ConversationItem> {
    const res: any = await api.post("/chat/conversation", {
      targetUserId,
      senderId,
    });
    return res.data?.data || res.data;
  },

  async getUserConversations(userId?: string): Promise<ConversationItem[]> {
    const res: any = await api.get("/chat/conversations", {
      params: userId ? { userId } : undefined,
    });
    return res.data?.data || res.data || [];
  },

  async getConversationMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<ConversationMessagesResponse> {
    const res: any = await api.get(`/chat/messages/${conversationId}`, {
      params: { page, limit },
    });
    const result = res.data?.data || res.data;
    return {
      meta: result?.meta || { total: 0, page: 1, limit: 50, totalPages: 1 },
      messages: result?.messages || (Array.isArray(result) ? result : []),
    };
  },

  async markAsRead(
    conversationId: string,
    userId?: string,
  ): Promise<{ success: boolean }> {
    const res: any = await api.post("/chat/read", {
      conversationId,
      userId,
    });
    return res.data?.data || res.data;
  },
};
