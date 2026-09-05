"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { X, Send } from "lucide-react";

interface PingModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  onSuccess?: () => void;
}

export default function PingModal({ isOpen, onClose, developer, onSuccess }: PingModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length > 300) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/pings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: developer.id,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to send ping");
      }

      toast.success(`Ping sent to ${developer.name}!`);
      setMessage("");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to send ping");
    } finally {
      setIsSending(false);
    }
  };

  // Close on Escape key
  if (isOpen) {
    window.onkeydown = (e) => {
      if (e.key === "Escape") onClose();
    };
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-6 glass-card border border-[#00E5FF]/30 bg-[#11111A]/95 shadow-2xl rounded-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              {developer.avatar ? (
                <img src={developer.avatar} alt={developer.name} className="w-12 h-12 rounded-full border border-[#00E5FF]/30 object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-black border border-[#00E5FF]/40 bg-gradient-to-br from-[#00E5FF] to-[#FF2BD6] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                  {developer.name?.charAt(0).toUpperCase() || "D"}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{developer.name}</h3>
                <p className="text-sm text-[#00E5FF] font-medium">{developer.role}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself and say why you'd like to collaborate..."
                  className="w-full h-32 px-4 py-3 bg-[#08080C] border border-[#00E5FF]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-colors resize-none placeholder:text-gray-500"
                  maxLength={300}
                />
                <div className={`absolute bottom-3 right-3 text-xs font-medium ${message.length > 290 ? "text-red-400" : "text-gray-500"}`}>
                  {message.length}/300
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black text-sm hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSending ? "Sending..." : "Send Ping"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
