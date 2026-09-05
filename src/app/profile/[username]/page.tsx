"use client";

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock, Target, Globe, Calendar, Check, Zap, Loader2, MessageSquare, ArrowLeft, Frown, Link as LinkIcon } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import PingModal from '@/components/PingModal';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { username } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isPingModalOpen, setIsPingModalOpen] = useState(false);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch user profile');
      }
      return res.json();
    },
  });

  const isOwnProfile = session?.user?.email === user?.email || (session?.user as any)?.username === user?.username;

  const handleStartChat = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/profile/${username}`);
      return;
    }
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: user.id }),
      });
      if (!res.ok) throw new Error('Failed to open chat');
      const data = await res.json();
      router.push(`/messages?chatId=${data.chatId || data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not open chat');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080C] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-[#08080C] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="glass-card p-10 max-w-md w-full border border-[#00E5FF]/20 bg-[#11111A]/90 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center mb-4 text-[#00E5FF]">
            <Frown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Developer Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">
            We couldn't find a developer matching <span className="text-[#00E5FF] font-mono">@{username}</span>. They may have changed their username or deleted their account.
          </p>
          <Link
            href="/developers"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black hover:scale-105 transition-all text-xs flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20"
          >
            <ArrowLeft className="w-4 h-4" /> Explore Developers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080C] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-[#00E5FF]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[650px] h-[650px] bg-[#FF2BD6]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#00E5FF] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#00E5FF]" /> Back
        </button>

        {/* PROFILE HERO CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#11111A]/90 border border-[#00E5FF]/20 rounded-3xl p-8 overflow-hidden backdrop-blur-2xl shadow-2xl relative"
        >
          {/* Top gradient stripe */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6]" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 relative">
              <UserAvatar user={user} size="xl" />
              {user.availability && (
                <span className="absolute bottom-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00E5FF] border-2 border-[#11111A]"></span>
                </span>
              )}
            </div>
            
            <div className="flex-grow space-y-4 w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                    {user.name}
                  </h1>
                  <p className="text-gray-400 text-sm font-mono">@{user.username}</p>
                  
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-[#00E5FF]/10 text-[#00E5FF] rounded-full text-xs font-black border border-[#00E5FF]/30">
                    <Zap className="w-3.5 h-3.5" />
                    {user.role || 'Full-Stack Developer'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <Link href="/profile/edit" className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all">
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={handleStartChat}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#00E5FF]/25 cursor-pointer hover:scale-105"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>

                      {user.pingStatus === 'pending' ? (
                        <button disabled className="px-5 py-2.5 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-bold cursor-not-allowed flex items-center gap-2">
                          <Check className="w-4 h-4" /> Ping Sent ✓
                        </button>
                      ) : user.pingStatus === 'accepted' ? (
                        <button disabled className="px-5 py-2.5 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-bold cursor-not-allowed flex items-center gap-2">
                          <Check className="w-4 h-4" /> Connected ✓
                        </button>
                      ) : (
                        <button 
                          onClick={() => setIsPingModalOpen(true)} 
                          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                        >
                          Ping Request →
                        </button>
                      )}
                    </>
                  )}

                  {/* Social Links */}
                  <div className="flex gap-2">
                    {user.githubUrl && (
                      <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/10 text-gray-300 hover:text-[#00E5FF] transition-colors">
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                    {user.linkedinUrl && (
                      <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/10 text-gray-300 hover:text-[#00E5FF] transition-colors">
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                    {user.twitterUrl && (
                      <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" title="Twitter" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/10 text-gray-300 hover:text-[#00E5FF] transition-colors">
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                    {user.portfolioUrl && (
                      <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" title="Portfolio" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/10 text-gray-300 hover:text-[#00E5FF] transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed max-w-2xl text-sm">
                {user.bio || <span className="text-gray-500 italic">No bio specified yet.</span>}
              </p>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-[#00E5FF]/20">
                {user.timezone && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-4 h-4 text-[#00E5FF]" /> {user.timezone}
                  </div>
                )}
                {user.availability && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-4 h-4 text-[#FF2BD6]" /> {user.availability}
                  </div>
                )}
                {user.lookingFor && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Target className="w-4 h-4 text-[#00E5FF]" /> Looking for: {user.lookingFor}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            
            {/* TECH STACK */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-lg font-bold mb-4 text-white">Tech Stack</h2>
              {user.stack && user.stack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.stack.map((tech: string, i: number) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-1.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono font-medium text-xs hover:bg-[#00E5FF]/20 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs italic">No tech stack listed.</p>
              )}
            </motion.div>

            {/* LOOKING FOR / PROJECT TYPES */}
            {user.lookingFor && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-lg font-bold mb-4 text-white">Looking For</h2>
                <div className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-5 italic text-gray-300 text-sm">
                  "{user.lookingFor}"
                </div>
                {user.projectType && user.projectType.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {user.projectType.map((type: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-xs border border-[#00E5FF]/30 font-bold">
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            {/* STATS & INFO */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4 backdrop-blur-xl"
            >
              <h3 className="font-bold border-b border-[#00E5FF]/20 pb-3 text-sm text-white">Profile Overview</h3>
              
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Calendar className="w-4 h-4 text-[#00E5FF]" />
                Member since {user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Target className="w-4 h-4 text-[#FF2BD6]" />
                Level: <span className="text-white capitalize font-semibold">{user.level || 'Intermediate'}</span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <MapPin className="w-4 h-4 text-[#00E5FF]" />
                Preference: <span className="text-white font-semibold">{user.isRemoteOnly ? 'Remote Only' : 'Open to Local & Remote'}</span>
              </div>
            </motion.div>
          </div>
        </div>

      </div>

      {isPingModalOpen && (
        <PingModal 
          isOpen={isPingModalOpen} 
          onClose={() => setIsPingModalOpen(false)} 
          developer={user}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['user', username] });
          }}
        />
      )}
    </div>
  );
}
