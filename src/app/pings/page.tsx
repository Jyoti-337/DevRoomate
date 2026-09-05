"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PingCard from '@/components/PingCard';

export default function PingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pings'],
    queryFn: () => fetch('/api/pings').then(res => {
      if (!res.ok) throw new Error('Failed to fetch pings');
      return res.json();
    }),
    enabled: status === 'authenticated'
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#08080C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
      </div>
    );
  }

  const currentPings = activeTab === 'received' ? data?.received || [] : data?.sent || [];
  
  const filteredPings = currentPings.filter((ping: any) => {
    if (filter === 'all') return true;
    if (filter === 'declined') return ping.status === 'rejected'; // Mongoose mapped
    return ping.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#08080C] text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white">My Pings</h1>
          <p className="text-gray-400 mt-2">Manage your collaboration requests</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#00E5FF]/20">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'received' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Inbox className="w-4 h-4" /> Received
            <span className="bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-full text-xs font-mono border border-[#00E5FF]/30">{data?.received?.length || 0}</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'sent' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Send className="w-4 h-4" /> Sent
            <span className="bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-full text-xs font-mono border border-[#00E5FF]/30">{data?.sent?.length || 0}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'pending', 'accepted', 'declined'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors capitalize cursor-pointer ${
                filter === f 
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Ping List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPings.length > 0 ? (
              filteredPings.map((ping: any) => (
                <PingCard 
                  key={ping.id} 
                  ping={ping} 
                  type={activeTab} 
                  onStatusChange={refetch} 
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-8 backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full flex items-center justify-center mb-4">
                  {activeTab === 'received' ? <Inbox className="w-8 h-8 text-[#00E5FF]" /> : <Send className="w-8 h-8 text-[#00E5FF]" />}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">No pings found</h3>
                <p className="text-gray-400 max-w-sm mx-auto">
                  {activeTab === 'received' 
                    ? "Your profile is live! Keep it updated to increase your chances of being discovered."
                    : "You haven't sent any pings yet. Go find some awesome developers to collaborate with!"}
                </p>
                {activeTab === 'received' ? (
                  <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/profile/${data?.user?.username || ''}`);
                    toast.success("Link copied!");
                  }} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    Share Profile
                  </button>
                ) : (
                  <button onClick={() => router.push('/developers')} className="mt-6 px-6 py-2 bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black rounded-lg text-sm transition-opacity shadow-lg shadow-[#00E5FF]/20 cursor-pointer">
                    Find Developers →
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
