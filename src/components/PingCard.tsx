"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Undo, ExternalLink, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PingWithUser } from '@/lib/types';
import UserAvatar from './UserAvatar';

interface PingCardProps {
  ping: PingWithUser;
  type: 'received' | 'sent';
  onStatusChange?: () => void;
}

export default function PingCard({ ping, type, onStatusChange }: PingCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // If received, show the sender. If sent, show the receiver.
  const displayUser = type === 'received' ? ping.sender : ping.receiver;

  const handleStartChat = async () => {
    try {
      setIsUpdating(true);
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: displayUser.id }),
      });
      if (!res.ok) throw new Error('Failed to open chat');
      const data = await res.json();
      if (data.chat?.id) {
        router.push(`/messages?chatId=${data.chat.id}`);
      }
    } catch (err) {
      toast.error('Could not start conversation');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'accepted' | 'rejected' | 'pending') => {
    setIsUpdating(true);
    
    // Optimistic UI for decline
    if (newStatus === 'rejected') {
      setIsVisible(false);
    }

    try {
      const res = await fetch(`/api/pings/${ping.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      if (newStatus === 'accepted') {
        toast.success(`Connected with ${displayUser.name}! Check their GitHub 🎉`);
      } else if (newStatus === 'rejected') {
        toast.success("Ping declined");
      }

      if (onStatusChange) onStatusChange();
    } catch (error) {
      setIsVisible(true); // Revert optimistic UI
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this ping request?")) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/pings/${ping.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel ping');
      toast.success("Ping cancelled");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      toast.error('Failed to cancel ping.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          exit={{ x: -100, opacity: 0, height: 0 }}
          className="w-full bg-[#11111A]/90 border border-[#00E5FF]/20 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start backdrop-blur-sm transition-all hover:border-[#00E5FF]/50"
        >
          {/* Avatar Column */}
          <div className="flex-shrink-0">
            <Link href={`/profile/${displayUser.username || displayUser.id}`}>
              <UserAvatar user={displayUser} size="lg" className="hover:scale-105 transition-transform" />
            </Link>
          </div>

          {/* Content Column */}
          <div className="flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Link href={`/profile/${displayUser.username || displayUser.id}`}>
                  <h3 className="text-xl font-bold text-white hover:text-[#00E5FF] transition-colors">
                    {displayUser.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400">{displayUser.role}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDistanceToNow(new Date(ping.createdAt), { addSuffix: true })}
              </span>
            </div>

            {displayUser.stack && displayUser.stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {displayUser.stack.slice(0, 3).map((tech, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {ping.message && (
              <div className="mt-2 pl-4 border-l-2 border-[#00E5FF]/60 italic text-gray-300 text-sm">
                "{ping.message}"
              </div>
            )}
          </div>

          {/* Actions Column */}
          <div className="flex-shrink-0 flex flex-col gap-2 min-w-[120px] ml-auto">
            {type === 'received' && ping.status === 'pending' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={isUpdating}
                  className="w-full py-2 px-4 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Accept
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isUpdating}
                  className="w-full py-2 px-4 rounded-lg bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
              </>
            )}

            {ping.status === 'accepted' && (
              <div className="flex flex-col gap-2 items-center w-full">
                <div className="flex items-center gap-1.5 text-[#00E5FF] text-xs font-semibold bg-[#00E5FF]/10 px-3 py-1.5 rounded-full border border-[#00E5FF]/30">
                  <Check className="w-3.5 h-3.5" /> Connected
                </div>
                <button
                  onClick={handleStartChat}
                  disabled={isUpdating}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                  Message
                </button>
                {displayUser.githubUrl && (
                  <a
                    href={displayUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-gray-400 hover:text-white hover:underline flex items-center gap-1 mt-0.5"
                  >
                    View GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {type === 'received' && ping.status === 'rejected' && (
              <div className="flex flex-col gap-2 items-center">
                <span className="text-gray-500 text-sm font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Declined</span>
                <button 
                  onClick={() => handleUpdateStatus('pending')}
                  disabled={isUpdating}
                  className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Undo className="w-3 h-3" /> Undo
                </button>
              </div>
            )}

            {type === 'sent' && ping.status === 'pending' && (
              <div className="flex flex-col gap-2">
                <span className="text-[#FF2BD6] text-sm font-medium px-3 py-1.5 rounded-full bg-[#FF2BD6]/10 text-center border border-[#FF2BD6]/30">Pending</span>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="w-full py-1.5 px-3 rounded-lg bg-transparent hover:bg-white/5 border border-white/10 text-red-400/70 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel Ping
                </button>
              </div>
            )}
            
            {type === 'sent' && ping.status === 'rejected' && (
              <span className="text-gray-500 text-sm font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">Declined</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
