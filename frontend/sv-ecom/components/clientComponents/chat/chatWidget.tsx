"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCheck,
  Headphones,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  User,
  X,
} from "lucide-react";
import {
  FaWhatsapp,
  FaFacebookMessenger,
  FaTelegramPlane,
} from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  whatsappNumber?: string;
  messengerUsername?: string;
  telegramUsername?: string;
}

export default function ChatWidget({
  whatsappNumber: propWhatsapp,
  messengerUsername: propMessenger,
  telegramUsername: propTelegram,
}: ChatWidgetProps) {
  const { data: themeData } = useTheme();
  const storePrimaryColor = useThemeStore((state) => state.primaryColor);
  const primaryColor =
    themeData?.primaryColor || storePrimaryColor || "#111827";

  const { user, isAuthenticated } = useAuthStore();

  const finalWhatsappNumber = String(
    propWhatsapp || themeData?.chat?.whatsappNumber || "8801700000000",
  );
  const finalMessengerUsername = String(
    propMessenger || themeData?.chat?.messengerUsername || "luminastore",
  );
  const finalTelegramUsername = String(
    propTelegram || themeData?.chat?.telegramUsername || "",
  );

  const isWhatsappEnabled = themeData?.chat?.isWhatsappEnabled ?? true;
  const isMessengerEnabled = themeData?.chat?.isMessengerEnabled ?? true;
  const isTelegramEnabled = Boolean(finalTelegramUsername.trim());

  const cleanWhatsappNumber = finalWhatsappNumber.replace(/\D/g, "");
  const cleanMessengerUsername = finalMessengerUsername.replace(/^@/, "");
  const cleanTelegramUsername = finalTelegramUsername.replace(/^@/, "");

  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    "Hello e-com Support, I have an inquiry.",
  )}`;
  const messengerUrl = `https://m.me/${cleanMessengerUsername}`;
  const telegramUrl = `https://t.me/${cleanTelegramUsername}`;

  const [isHovered, setIsHovered] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  const [guestName, setGuestName] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [hasGuestSession, setHasGuestSession] = React.useState(false);
  const [inputText, setInputText] = React.useState("");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    initConversation,
    sendMessage,
    sendTyping,
    clearUnread,
    unreadCount,
    isTyping,
    currentUserId,
    isMessagesLoading,
  } = useChat(undefined, "ADMIN", isChatOpen);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("lumina_guest_chat");
      if (stored) {
        setHasGuestSession(true);
      }
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated || hasGuestSession) {
      initConversation("ADMIN");
    }
  }, [isAuthenticated, hasGuestSession, initConversation]);

  React.useEffect(() => {
    if (isChatOpen) {
      clearUnread();
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen, clearUnread]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!isChatOpen) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    const guestId = `GUEST_${guestPhone.trim().replace(/\D/g, "")}_${Date.now().toString().slice(-4)}`;
    const guestData = {
      id: guestId,
      name: guestName.trim(),
      phone: guestPhone.trim(),
    };

    sessionStorage.setItem("lumina_guest_chat", JSON.stringify(guestData));
    setHasGuestSession(true);
    initConversation("ADMIN");
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText("");
  };

  const handleOpenLiveChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHovered(false);
    setIsChatOpen(true);
    clearUnread();
  };

  const handleMainButtonClick = () => {
    setIsChatOpen((prev) => !prev);
    setIsHovered(false);
  };

  if (!isMounted) return null;

  return (
    <div
      style={{ "--primary": primaryColor } as React.CSSProperties}
      className="fixed bottom-6 right-6 z-[9999] pointer-events-auto flex flex-col items-end"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] sm:w-[390px] h-[520px] bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Headphones size={20} className="text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-gray-900" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    e-com Concierge
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    Online &bull; Live Support
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {!isAuthenticated && !hasGuestSession ? (
              <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <MessageCircle size={24} />
                  </div>
                  <h4 className="font-black text-lg text-gray-900 uppercase tracking-tight">
                    Start Live Chat
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                    Please provide your name and mobile number so our team can
                    assist you.
                  </p>
                </div>

                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        required
                        placeholder="e.g. John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="pl-10 h-11 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        required
                        placeholder="e.g. 01700000000"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="pl-10 h-11 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
                  >
                    Connect with Agent
                  </Button>
                </form>
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fafafa]">
                  {isMessagesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2
                        className="animate-spin text-gray-300"
                        size={24}
                      />
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <MessageCircle size={32} className="text-gray-300" />
                      <p className="text-xs font-bold text-gray-700">
                        How can we assist you?
                      </p>
                      <p className="text-[11px] text-gray-400 max-w-[200px]">
                        Send us a message and our support team will reply
                        instantly.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUserId;
                      const time = new Date(msg.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      );

                      return (
                        <div
                          key={msg.id || msg._id || idx}
                          className={cn(
                            "flex flex-col",
                            isMe ? "items-end" : "items-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm",
                              isMe
                                ? "bg-gray-900 text-white rounded-br-xs"
                                : "bg-white text-gray-900 border border-gray-100 rounded-bl-xs",
                            )}
                          >
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
                    <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium italic">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Agent is typing...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
                >
                  <Input
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      sendTyping(true);
                    }}
                    className="h-11 rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputText.trim()}
                    className="h-11 w-11 rounded-xl bg-gray-900 text-white hover:bg-gray-800 shrink-0 cursor-pointer"
                  >
                    <Send size={15} />
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-3">
        <AnimatePresence>
          {isHovered && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 pb-1"
            >
              {isWhatsappEnabled && (
                <div className="relative group/btn flex items-center justify-end w-full">
                  <span className="absolute right-14 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                    WhatsApp Chat
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsHovered(false)}
                    className="h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                  >
                    <FaWhatsapp className="h-6 w-6" />
                  </a>
                </div>
              )}

              {isMessengerEnabled && (
                <div className="relative group/btn flex items-center justify-end w-full">
                  <span className="absolute right-14 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                    Facebook Messenger
                  </span>
                  <a
                    href={messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsHovered(false)}
                    className="h-12 w-12 rounded-full bg-[#0084FF] hover:bg-[#0073e6] text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                  >
                    <FaFacebookMessenger className="h-5 w-5" />
                  </a>
                </div>
              )}

              {isTelegramEnabled && (
                <div className="relative group/btn flex items-center justify-end w-full">
                  <span className="absolute right-14 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                    Telegram Support
                  </span>
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsHovered(false)}
                    className="h-12 w-12 rounded-full bg-[#229ED9] hover:bg-[#1d8bc0] text-white shadow-lg shadow-sky-500/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                  >
                    <FaTelegramPlane className="h-5 w-5" />
                  </a>
                </div>
              )}

              <div className="relative group/btn flex items-center justify-end w-full">
                <span className="absolute right-14 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                  Live Support Chat
                </span>
                <button
                  type="button"
                  onClick={handleOpenLiveChat}
                  className="h-12 w-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                >
                  <Headphones className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleMainButtonClick}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer z-10 relative",
            isChatOpen
              ? "bg-primary text-white"
              : "bg-primary text-white shadow-gray-900/40",
          )}
        >
          {!isChatOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white animate-in zoom-in">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {isChatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
}
