"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Search,
  MessageSquare,
  Check,
  CheckCheck,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import { pusherClient } from "@/lib/pusher";
import { formatDistanceToNow, format } from "date-fns";

interface ChatParticipant {
  id: string;
  name: string;
  email?: string;
  image?: string;
  avatar?: string;
  username?: string;
  role?: string;
  availability?: string;
}

interface ChatThread {
  id: string;
  participants: ChatParticipant[];
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

interface MessageObj {
  id: string;
  chatId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image?: string;
    username?: string;
  };
  content: string;
  seen: boolean;
  createdAt: string;
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get("chatId");

  const [chats, setChats] = useState<ChatThread[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(urlChatId);
  const [messages, setMessages] = useState<MessageObj[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");

  // Mobile layout view toggle: false = conversation list, true = active chat thread
  const [showMobileThread, setShowMobileThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Authenticate user
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/messages");
    }
  }, [status, router]);

  // Fetch all chats for current user
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      const contentType = res.headers.get("content-type") || "";
      let data: any = {};

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("GET /api/chats returned non-JSON response:", res.status, text);
        throw new Error(`Server error (${res.status}). Failed to load conversations.`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to load chats");
      }

      setChats(data.chats || []);

      // If URL has chatId or no active chat is selected yet, select first chat
      if (urlChatId) {
        setActiveChatId(urlChatId);
        setShowMobileThread(true);
      }
    } catch (err: any) {
      console.error("fetchChats error:", err);
      toast.error(err.message || "Could not fetch messages");
    } finally {
      setLoadingChats(false);
    }
  }, [urlChatId]);

  useEffect(() => {
    if (session?.user) {
      fetchChats();
    }
  }, [session, fetchChats]);

  // Mark messages as read in backend
  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await fetch(`/api/chats/${chatId}/read`, { method: "PATCH" });
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error("Failed to mark messages read:", err);
    }
  }, []);

  // Fetch messages for active chat
  const fetchMessages = useCallback(
    async (chatId: string) => {
      try {
        setLoadingMessages(true);
        const res = await fetch(`/api/chats/${chatId}/messages?limit=30`);
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();

        setMessages(data.messages || []);
        setHasMoreMessages(!!data.hasMore);

        // Mark as read
        markAsRead(chatId);

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err: any) {
        toast.error(err.message || "Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    },
    [markAsRead]
  );

  // Load older messages (Cursor Pagination) when scrolling up
  const loadOlderMessages = async () => {
    if (!activeChatId || loadingMore || !hasMoreMessages || messages.length === 0)
      return;

    const oldestMessage = messages[0];
    const beforeCursor = oldestMessage.createdAt;

    try {
      setLoadingMore(true);
      const scrollContainer = chatScrollContainerRef.current;
      const previousScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0;

      const res = await fetch(
        `/api/chats/${activeChatId}/messages?before=${encodeURIComponent(
          beforeCursor
        )}&limit=30`
      );
      if (!res.ok) throw new Error("Failed to load older messages");

      const data = await res.json();
      const older = data.messages || [];

      setMessages((prev) => [...older, ...prev]);
      setHasMoreMessages(!!data.hasMore);

      // Restore scroll position after prepend
      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop =
            scrollContainer.scrollHeight - previousScrollHeight;
        }
      }, 50);
    } catch (err: any) {
      toast.error("Failed to load older messages");
    } finally {
      setLoadingMore(false);
    }
  };

  // Scroll event listener for infinite scroll up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop < 50 && hasMoreMessages && !loadingMore) {
      loadOlderMessages();
    }
  };

  // Handle selecting a chat
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setShowMobileThread(true);
  };

  // Fetch messages & subscribe to Pusher when active chat changes
  useEffect(() => {
    if (!activeChatId) return;

    fetchMessages(activeChatId);

    // Subscribe to Pusher channel
    const channelName = `chat-${activeChatId}`;
    const channel = pusherClient?.subscribe ? pusherClient.subscribe(channelName) : null;

    if (channel) {
      channel.bind("new-message", (newMsg: MessageObj) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // Update sidebar chat lastMessage
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, lastMessage: newMsg.content, updatedAt: new Date().toISOString() }
              : c
          )
        );

        // If user is actively viewing thread, mark as read
        if (newMsg.senderId !== session?.user?.id) {
          markAsRead(activeChatId);
        }

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });

      channel.bind("messages-seen", ({ userId }: { userId: string }) => {
        if (userId !== session?.user?.id) {
          setMessages((prev) =>
            prev.map((m) => (m.senderId === session?.user?.id ? { ...m, seen: true } : m))
          );
        }
      });
    }

    // Safe fallback polling interval every 4 seconds in case Pusher keys are unconfigured locally
    const pollInterval = setInterval(() => {
      fetch(`/api/chats/${activeChatId}/messages?limit=30`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            setMessages((prev) => {
              if (data.messages.length !== prev.length) {
                return data.messages;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 4000);

    return () => {
      if (pusherClient?.unsubscribe) {
        pusherClient.unsubscribe(channelName);
      }
      clearInterval(pollInterval);
    };
  }, [activeChatId, fetchMessages, markAsRead, session?.user?.id]);

  // Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !newMessageText.trim() || sending) return;

    const content = newMessageText.trim();
    setNewMessageText("");
    setSending(true);

    try {
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON API response when sending message:", text);
        throw new Error(`Server error (${res.status}). Could not send message.`);
      }

      if (res.status === 429) {
        toast.error(data.error || "Rate limit exceeded. Please wait a few seconds.");
        setNewMessageText(content); // restore typed text
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Append optimistically if not already in state via Pusher
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, lastMessage: content, updatedAt: new Date().toISOString() }
              : c
          )
        );
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
      setNewMessageText(content);
    } finally {
      setSending(false);
    }
  };

  // Find recipient user details for active chat
  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeRecipient = activeChat?.participants.find(
    (p) => p.id !== session?.user?.id
  );

  // Filtered chats list by search
  const filteredChats = chats.filter((chat) => {
    const recipient = chat.participants.find((p) => p.id !== session?.user?.id);
    return (
      recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (status === "loading" || loadingChats) {
    return (
      <div className="min-h-screen bg-[#08080C] text-white flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080C] text-white flex flex-col overflow-hidden font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 flex flex-col h-[calc(100vh-20px)]">
        <div className="flex-1 bg-[#11111A]/90 border border-[#00E5FF]/20 rounded-2xl backdrop-blur-xl overflow-hidden flex shadow-2xl relative">
          
          {/* ================= SIDEBAR: CONVERSATION LIST ================= */}
          <div
            className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-[#00E5FF]/20 flex flex-col ${
              showMobileThread ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#00E5FF]/20 flex items-center justify-between">
              <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-[#00E5FF]" />
                Messages
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-black">
                {chats.length} {chats.length === 1 ? "thread" : "threads"}
              </span>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-[#00E5FF]/20">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#08080C] border border-[#00E5FF]/20 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500">
                  <UserIcon className="w-10 h-10 mb-2 opacity-40 text-[#00E5FF]" />
                  <p className="text-sm font-medium text-gray-400">No conversations yet</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Accept a ping or click message on a developer profile to start chatting.
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const recipient = chat.participants.find(
                    (p) => p.id !== session?.user?.id
                  ) || { name: "Developer", id: "dev" };

                  const isActive = chat.id === activeChatId;

                  return (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={`w-full p-4 flex items-center gap-3 transition-colors text-left relative cursor-pointer ${
                        isActive
                          ? "bg-[#00E5FF]/10 border-l-4 border-[#00E5FF]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="relative">
                        <UserAvatar user={recipient} size="md" />
                        {recipient.availability?.toLowerCase().includes("open") && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00E5FF] border-2 border-[#08080C] rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-sm font-bold text-white truncate">
                            {recipient.name}
                          </h3>
                          {chat.updatedAt && (
                            <span className="text-[10px] text-gray-500 flex-shrink-0">
                              {formatDistanceToNow(new Date(chat.updatedAt), {
                                addSuffix: false,
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <p
                            className={`text-xs truncate max-w-[180px] ${
                              chat.unreadCount > 0
                                ? "text-[#00E5FF] font-semibold"
                                : "text-gray-400"
                            }`}
                          >
                            {chat.lastMessage || "Started a conversation"}
                          </p>

                          {chat.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-[#FF2BD6] text-white text-[10px] font-black rounded-full animate-pulse">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= MAIN PANEL: ACTIVE CHAT THREAD ================= */}
          <div
            className={`flex-1 flex flex-col h-full bg-[#08080C]/60 ${
              showMobileThread ? "flex" : "hidden md:flex"
            }`}
          >
            {activeChatId && activeRecipient ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 border-b border-[#00E5FF]/20 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setShowMobileThread(false)}
                      className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <UserAvatar user={activeRecipient} size="md" />

                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        {activeRecipient.name}
                        {activeRecipient.role && (
                          <span className="text-xs text-[#00E5FF] font-normal">
                            • {activeRecipient.role}
                          </span>
                        )}
                      </h2>
                      <p className="text-[11px] text-gray-400">
                        {activeRecipient.availability || "Developer"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Scroll Area */}
                <div
                  ref={chatScrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {/* Loading Older Indicator */}
                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#00E5FF]" />
                    </div>
                  )}

                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-8">
                      <MessageSquare className="w-12 h-12 mb-3 text-[#00E5FF]/40" />
                      <p className="text-base font-semibold text-gray-300">
                        Say hello to {activeRecipient.name}!
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        Start discussing project ideas, hackathons, tech stacks, or collaboration terms.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const currentUserId = session?.user?.id ? String(session.user.id) : null;
                      const rawSender = msg.senderId || msg.sender?.id;
                      const msgSenderId =
                        typeof rawSender === "object" && rawSender !== null
                          ? String((rawSender as any)._id || (rawSender as any).id || "")
                          : String(rawSender || "");

                      const isMe = Boolean(
                        currentUserId && msgSenderId && currentUserId === msgSenderId
                      );

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex flex-col ${
                            isMe ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                              isMe
                                ? "bg-gradient-to-r from-[#00E5FF] to-[#8C64FF] text-black font-medium rounded-br-none"
                                : "bg-white/10 text-gray-100 rounded-bl-none border border-white/10"
                            }`}
                          >
                            {!isMe && msg.sender?.name && (
                              <p className="text-[10px] font-bold text-[#00E5FF] mb-1">
                                {msg.sender.name}
                              </p>
                            )}

                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] ${
                                isMe ? "justify-end text-black/70" : "text-gray-400"
                              }`}
                            >
                              <span>
                                {msg.createdAt
                                  ? format(new Date(msg.createdAt), "h:mm a")
                                  : ""}
                              </span>

                              {isMe && (
                                <span className="ml-1" title={msg.seen ? "Seen" : "Sent"}>
                                  {msg.seen ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-black" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 opacity-70 text-black" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-[#00E5FF]/20 bg-white/[0.02] flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder={`Message ${activeRecipient.name}...`}
                    className="flex-1 px-4 py-3 bg-[#08080C] border border-[#00E5FF]/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
                    maxLength={2000}
                    disabled={sending}
                  />

                  <button
                    type="submit"
                    disabled={sending || !newMessageText.trim()}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black text-sm hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Empty Chat Selection State */
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <MessageSquare className="w-16 h-16 mb-4 text-[#00E5FF]/20" />
                <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Choose a developer thread from the sidebar to view your message history and start collaborating.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080C] text-white flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex items-center justify-center pt-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
          </div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
