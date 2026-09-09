import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import {
  chatService,
  type MessageItem,
  type ConversationItem,
} from "@/services/chatService";
import { useAuthStore } from "@/store/useAuthStore";

export function useChat(
  conversationId?: string,
  targetUserId = "ADMIN",
  isWindowOpen = false,
) {
  const queryClient = useQueryClient();
  const { user, vendor, isAuthenticatedVendor } = useAuthStore();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ConversationItem | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  const getGuestInfo = () => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("lumina_guest_chat");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const activeAccount = vendor || user;
  const guest = getGuestInfo();

  const currentUserId = activeAccount
    ? activeAccount.id ||
      (activeAccount as any)?.userId ||
      (activeAccount as any)?._id ||
      "ADMIN"
    : guest?.id || "";

  const currentUserName = activeAccount
    ? activeAccount.name || (vendor ? "Administrator" : "Customer")
    : guest?.name || "Guest";

  const currentUserRole = activeAccount
    ? (activeAccount as any)?.role ||
      (vendor || isAuthenticatedVendor ? "ADMIN" : "USER")
    : "USER";

  const effectiveConvId =
    conversationId || activeConversation?._id || activeConversation?.id;

  const { data: initialMessagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["chat-messages", effectiveConvId],
    queryFn: () =>
      chatService.getConversationMessages(effectiveConvId as string),
    enabled: !!effectiveConvId,
  });

  useEffect(() => {
    const nextMessages = Array.isArray(initialMessagesData?.messages)
      ? initialMessagesData.messages
      : [];
    if (nextMessages.length > 0) {
      setMessages(nextMessages);
      nextMessages.forEach((m) => {
        if (m._id) seenMessageIdsRef.current.add(m._id);
        if (m.id) seenMessageIdsRef.current.add(m.id);
      });
    }
  }, [initialMessagesData]);

  useEffect(() => {
    if (isWindowOpen) {
      setUnreadCount(0);
    }
  }, [isWindowOpen]);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = getSocket(currentUserId, currentUserName, currentUserRole);

    if (effectiveConvId) {
      socket.emit("joinConversation", { conversationId: effectiveConvId });
      if (isWindowOpen) {
        socket.emit("markRead", {
          conversationId: effectiveConvId,
          userId: currentUserId,
        });
        chatService.markAsRead(effectiveConvId, currentUserId);
      }
    }

    const handleNewMessage = (newMsg: MessageItem) => {
      const msgKey = newMsg._id || newMsg.id || "";
      const incomingConvId = String(newMsg.conversationId);
      const activeId = String(effectiveConvId || "");

      const isFromMe =
        newMsg.senderId === currentUserId ||
        (currentUserRole === "ADMIN" &&
          (newMsg.senderRole === "ADMIN" || newMsg.senderRole === "STAFF"));

      if (incomingConvId === activeId && activeId) {
        setMessages((prev) => {
          const matchIndex = prev.findIndex(
            (m) =>
              (m._id && m._id === newMsg._id) ||
              (m.id && m.id === newMsg._id) ||
              (m.id && m.id === newMsg.id) ||
              (m.senderId === newMsg.senderId &&
                m.content === newMsg.content &&
                (String(m.id).startsWith("temp_") ||
                  String(m._id).startsWith("temp_"))),
          );

          if (matchIndex !== -1) {
            const updated = [...prev];
            updated[matchIndex] = newMsg;
            return updated;
          }

          return [...prev, newMsg];
        });

        if (!isFromMe) {
          if (isWindowOpen) {
            socket.emit("markRead", {
              conversationId: incomingConvId,
              userId: currentUserId,
            });
          } else if (!seenMessageIdsRef.current.has(msgKey)) {
            seenMessageIdsRef.current.add(msgKey);
            setUnreadCount((prev) => prev + 1);
          }
        }
      } else if (!isFromMe && !seenMessageIdsRef.current.has(msgKey)) {
        seenMessageIdsRef.current.add(msgKey);
        setUnreadCount((prev) => prev + 1);
      }

      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    };

    const handleUserTyping = (data: {
      conversationId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      if (String(data.conversationId) === String(effectiveConvId)) {
        if (data.isTyping) {
          setTypingUser(data.userName);
          setIsTyping(true);
        } else {
          setIsTyping(false);
          setTypingUser(null);
        }
      }
    };

    const handleMessagesRead = (data: {
      conversationId: string;
      userId: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.readBy?.includes(data.userId)) {
            return { ...m, readBy: [...(m.readBy || []), data.userId] };
          }
          return m;
        }),
      );
      if (data.userId === currentUserId) {
        setUnreadCount(0);
      }
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("inboxUpdated", () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    });
    socket.on("userTyping", handleUserTyping);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("inboxUpdated");
      socket.off("userTyping", handleUserTyping);
      socket.off("messagesRead", handleMessagesRead);
      if (effectiveConvId) {
        socket.emit("leaveConversation", { conversationId: effectiveConvId });
      }
    };
  }, [
    currentUserId,
    currentUserName,
    currentUserRole,
    effectiveConvId,
    isWindowOpen,
    queryClient,
  ]);

  const initConversation = useCallback(
    async (targetId = targetUserId) => {
      if (!currentUserId) return null;
      try {
        const conv = await chatService.getOrCreateConversation(
          targetId,
          currentUserId,
        );
        setActiveConversation(conv);
        return conv;
      } catch {
        return null;
      }
    },
    [currentUserId, targetUserId],
  );

  const sendMessage = useCallback(
    async (content: string, attachments: string[] = []) => {
      if (!content.trim() || !effectiveConvId || !currentUserId) return;

      const socket = getSocket(currentUserId, currentUserName, currentUserRole);

      const optimisticMessage: MessageItem = {
        id: `temp_${Date.now()}`,
        conversationId: effectiveConvId,
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole as any,
        content: content.trim(),
        attachments,
        readBy: [currentUserId],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      socket.emit("sendMessage", {
        conversationId: effectiveConvId,
        content: content.trim(),
        attachments,
      });

      socket.emit("typing", {
        conversationId: effectiveConvId,
        isTyping: false,
      });
    },
    [effectiveConvId, currentUserId, currentUserName, currentUserRole],
  );

  const sendTyping = useCallback(
    (isUserTyping: boolean) => {
      if (!effectiveConvId || !currentUserId) return;

      const socket = getSocket(currentUserId, currentUserName, currentUserRole);

      socket.emit("typing", {
        conversationId: effectiveConvId,
        isTyping: isUserTyping,
      });

      if (isUserTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("typing", {
            conversationId: effectiveConvId,
            isTyping: false,
          });
        }, 2000);
      }
    },
    [effectiveConvId, currentUserId, currentUserName, currentUserRole],
  );

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
    if (effectiveConvId && currentUserId) {
      chatService.markAsRead(effectiveConvId, currentUserId);
    }
  }, [effectiveConvId, currentUserId]);

  return {
    messages,
    activeConversation,
    setActiveConversation,
    initConversation,
    sendMessage,
    sendTyping,
    clearUnread,
    unreadCount,
    isTyping,
    typingUser,
    isMessagesLoading,
    currentUserId,
    currentUserRole,
  };
}
