"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bell, 
  Eye, 
  Zap, 
  Loader2, 
  ArrowRight, 
  LayoutDashboard, 
  FolderPlus, 
  MessageSquare, 
  User as UserIcon,
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  MapPin,
  Clock,
  ExternalLink,
  Target
} from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import PingCard from '@/components/PingCard';
import ProfileCompletion from '@/components/ProfileCompletion';
import { DashboardData } from '@/lib/types';
import { toast } from 'sonner';

type TabType = 'overview' | 'projects' | 'pings' | 'profile';

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // A) Fetch core dashboard metrics
  const { data, isLoading, refetch: refetchDashboard } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(res => {
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    }),
    enabled: status === 'authenticated'
  });

  // B) Fetch current user's collaboration posts
  const { data: userProjectsData, isLoading: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['myProjects', data?.user?.id],
    queryFn: () => fetch(`/api/requests?userId=${data?.user?.id}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch user requests');
      return res.json();
    }),
    enabled: !!data?.user?.id
  });

  // C) Mutations for Pings (Accept / Decline)
  const updatePingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => {
      const res = await fetch(`/api/pings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update ping');
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Ping status updated to ${variables.status}! 🎉`);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['pings'] });
      refetchDashboard();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Something went wrong');
    }
  });

  // D) Mutations for Collab Requests (Toggle status / Delete)
  const toggleProjectStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'closed' }) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Project status updated successfully!');
      refetchProjects();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete request');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Project request deleted successfully!');
      refetchProjects();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#08080C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">Syncing developer metrics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Project Posts', icon: FolderPlus },
    { id: 'pings', label: 'Pings Feed', icon: MessageSquare },
    { id: 'profile', label: 'My Profile Info', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#08080C] text-white flex flex-col md:flex-row font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-[#11111A]/90 border-b md:border-b-0 md:border-r border-[#00E5FF]/20 backdrop-blur-xl p-6 flex flex-col gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group focus:outline-none">
          <span className="text-[#00E5FF] font-bold text-xl">{"</>"}</span>
          <span className="text-xl font-bold text-white">
            Dev<span className="text-[#00E5FF]">Roommate</span>
          </span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-[#00E5FF]/20 rounded-xl">
          <UserAvatar user={data.user} size="sm" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-white truncate">{data.user.name}</h4>
            <p className="text-xs text-gray-400 truncate">@{data.user.username}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  active 
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        {/* Back Link */}
        <div className="mt-auto hidden md:block">
          <Link href="/" className="text-xs text-gray-500 hover:text-[#00E5FF] flex items-center gap-1 transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* A) TOP DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              {activeTab === 'overview' && `Welcome back, ${data.user.name?.split(' ')[0] || 'Developer'} 👋`}
              {activeTab === 'projects' && 'My Collaboration Posts'}
              {activeTab === 'pings' && 'Pings & Connections'}
              {activeTab === 'profile' && 'My Profile Settings'}
            </h1>
            <p className="text-gray-400 mt-1">
              {activeTab === 'overview' && "Here's a comprehensive overview of your collaboration activity."}
              {activeTab === 'projects' && 'Manage your active and closed collaboration requests.'}
              {activeTab === 'pings' && 'Accept incoming connections or track your outstanding requests.'}
              {activeTab === 'profile' && 'Review your profile availability and contact preferences.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/profile/edit"
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-colors flex items-center gap-2"
            >
              Edit Profile
            </Link>
            <Link 
              href={`/profile/${data.user.username}`}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black text-sm transition-opacity shadow-lg shadow-[#00E5FF]/20 flex items-center gap-2"
            >
              View Public Profile <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* B) ACTIVE TAB CONTENT WORKSPACE */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            
            {/* ==================== OVERVIEW TAB ==================== */}
            {activeTab === 'overview' && (
              <>
                {/* 1. Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Pings Sent", value: data.stats.pingsSent, icon: Send, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10" },
                    { label: "Pings Received", value: data.stats.pingsReceived, icon: Bell, color: "text-[#FF2BD6]", bg: "bg-[#FF2BD6]/10" },
                    { label: "Profile Views", value: data.stats.profileViews || 12, icon: Eye, color: "text-[#8C64FF]", bg: "bg-[#8C64FF]/10" },
                    { label: "Avg Match Score", value: `${data.stats.avgMatchScore}%`, icon: Zap, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex justify-between items-start hover:border-[#00E5FF]/40 transition-all">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
                        <h3 className="text-3xl font-bold mt-2 font-mono text-white">{stat.value}</h3>
                      </div>
                      <div className={`p-3.5 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Completion Card */}
                <ProfileCompletion user={data.user} />

                {/* 3. Columns Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column (Pings received) */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        Recent Pings Received
                        <span className="bg-[#00E5FF]/10 text-xs px-2.5 py-1 rounded-full font-mono text-[#00E5FF] border border-[#00E5FF]/30">{data.stats.pingsReceived}</span>
                      </h2>
                      <button onClick={() => setActiveTab('pings')} className="text-xs font-bold text-[#00E5FF] hover:text-[#00E5FF]/80 flex items-center gap-1 cursor-pointer">
                        Go to Inbox <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {data.recentPingsReceived.length > 0 ? (
                      <div className="space-y-4">
                        {data.recentPingsReceived.map(ping => (
                          <div key={ping.id} className="relative group">
                            <PingCard ping={ping} type="received" />
                            {ping.status === 'pending' && (
                              <div className="absolute top-4 right-4 flex gap-2">
                                <button 
                                  onClick={() => updatePingMutation.mutate({ id: ping.id, status: 'accepted' })}
                                  disabled={updatePingMutation.isPending}
                                  className="p-1.5 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF] hover:text-black transition-all shadow-md cursor-pointer"
                                  title="Accept Connection"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => updatePingMutation.mutate({ id: ping.id, status: 'rejected' })}
                                  disabled={updatePingMutation.isPending}
                                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer"
                                  title="Decline Connection"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-10 text-center backdrop-blur-sm">
                        <Bell className="w-8 h-8 text-gray-500 mx-auto mb-3 animate-bounce" />
                        <h4 className="font-bold text-white mb-1">Your Inbox is Clear!</h4>
                        <p className="text-sm text-gray-400">Complete your profile card to increase discoverability.</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column (Matches) */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Top Developer Matches</h2>
                    <div className="space-y-3">
                      {data.topMatches && data.topMatches.length > 0 ? (
                        data.topMatches.map(match => (
                          <Link 
                            key={match.id} 
                            href={`/profile/${match.username}`}
                            className="block bg-[#11111A]/80 hover:bg-[#151522] border border-[#00E5FF]/20 rounded-2xl p-4 transition-all hover:scale-[1.01] hover:border-[#00E5FF]/40"
                          >
                            <div className="flex items-center gap-3">
                              <UserAvatar user={match} size="md" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-sm truncate">{match.name}</h4>
                                <p className="text-xs text-gray-400 truncate">{match.role}</p>
                              </div>
                              <div className="bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 font-mono">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                {match.matchScore}%
                              </div>
                            </div>
                            {match.stack && match.stack.length > 0 && (
                              <div className="mt-3 flex gap-1.5 overflow-hidden">
                                {match.stack.slice(0, 3).map((tech, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] font-medium uppercase border border-[#00E5FF]/20">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">No matches available. Add more skills to your profile stack.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ==================== PROJECTS MANAGEMENT TAB ==================== */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">My Project Requests</h2>
                  <Link 
                    href="/post-request"
                    className="px-4 py-2 bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black rounded-lg text-sm transition-opacity flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20"
                  >
                    <PlusCircle className="w-4 h-4" /> Create New Post
                  </Link>
                </div>

                {loadingProjects ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
                  </div>
                ) : userProjectsData?.requests?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProjectsData.requests.map((project: any) => (
                      <div key={project.id} className="glass-card p-6 bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl flex flex-col h-full hover:border-[#00E5FF]/40 transition-all shadow-xl">
                        {/* Header details */}
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2 py-0.5 rounded">
                              {project.projectType}
                            </span>
                            <h3 className="font-bold text-lg text-white mt-2 line-clamp-1">{project.title}</h3>
                          </div>
                          
                          {/* Active / Closed status badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            project.status === 'active' 
                              ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {project.status === 'active' ? 'Active' : 'Closed'}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Stack and timeline */}
                        <div className="space-y-3 mt-auto">
                          {project.stackNeeded && project.stackNeeded.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Stack Needed</p>
                              <div className="flex flex-wrap gap-1.5">
                                {project.stackNeeded.map((tech: string, i: number) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 font-semibold border border-white/10">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                            {/* Actions CRUD */}
                            <div className="flex gap-2 w-full justify-between items-center">
                              <button
                                onClick={() => toggleProjectStatusMutation.mutate({ 
                                  id: project.id, 
                                  status: project.status === 'active' ? 'closed' : 'active' 
                                })}
                                disabled={toggleProjectStatusMutation.isPending}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                  project.status === 'active' 
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500 hover:text-black' 
                                    : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 hover:bg-[#00E5FF] hover:text-black'
                                }`}
                              >
                                {project.status === 'active' ? (
                                  <>
                                    <ToggleRight className="w-4 h-4" /> Close Post
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4" /> Open Post
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm('Are you absolutely sure you want to delete this collab request?')) {
                                    deleteProjectMutation.mutate(project.id);
                                  }
                                }}
                                disabled={deleteProjectMutation.isPending}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow cursor-pointer"
                                title="Delete Project Request"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6">
                    <FolderPlus className="w-12 h-12 text-gray-500 mx-auto" />
                    <div>
                      <h3 className="font-bold text-lg text-white">No Collaboration Requests Found</h3>
                      <p className="text-sm text-gray-400 mt-2">
                        You haven't posted any developer search requests yet. Create one now to find stack-aligned developers!
                      </p>
                    </div>
                    <Link 
                      href="/post-request"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black rounded-lg text-sm transition-opacity shadow-lg shadow-[#00E5FF]/20"
                    >
                      <PlusCircle className="w-4.5 h-4.5" /> Post Your First Request
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ==================== PINGS INBOX FEED TAB ==================== */}
            {activeTab === 'pings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side: Received */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    Received Pings
                    <span className="bg-[#00E5FF]/10 text-xs px-2 py-0.5 rounded-full font-mono text-[#00E5FF] border border-[#00E5FF]/30">
                      {data.recentPingsReceived.length}
                    </span>
                  </h2>

                  {data.recentPingsReceived.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentPingsReceived.map(ping => (
                        <div key={ping.id} className="relative group">
                          <PingCard ping={ping} type="received" />
                          
                          {/* Approve/Decline Controls overlay */}
                          {ping.status === 'pending' && (
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button 
                                onClick={() => updatePingMutation.mutate({ id: ping.id, status: 'accepted' })}
                                disabled={updatePingMutation.isPending}
                                className="px-3 py-1 text-xs font-bold rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF] hover:text-black transition-all shadow flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button 
                                onClick={() => updatePingMutation.mutate({ id: ping.id, status: 'rejected' })}
                                disabled={updatePingMutation.isPending}
                                className="px-3 py-1 text-xs font-bold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic py-4">No incoming connection pings received yet.</p>
                  )}
                </div>

                {/* Right side: Sent */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    Sent Pings
                    <span className="bg-[#FF2BD6]/10 text-xs px-2 py-0.5 rounded-full font-mono text-[#FF2BD6] border border-[#FF2BD6]/30">
                      {data.recentPingsSent.length}
                    </span>
                  </h2>

                  {data.recentPingsSent.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentPingsSent.map(ping => (
                        <PingCard key={ping.id} ping={ping} type="sent" />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-6 text-center">
                      <p className="text-gray-400 text-sm mb-3">You haven't pinged anyone yet.</p>
                      <Link 
                        href="/developers" 
                        className="text-[#00E5FF] hover:text-[#00E5FF]/80 text-xs font-bold flex items-center gap-1 justify-center"
                      >
                        Explore available developers <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== PROFILE INFO METRICS TAB ==================== */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Details card */}
                <div className="md:col-span-2 bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white">Bio & Presentation</h3>
                      <p className="text-xs text-gray-400">This is how your bio cards display to matching developers.</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#08080C] border border-[#00E5FF]/20 rounded-xl p-4 italic text-gray-300 leading-relaxed text-sm">
                    "{data.user.bio || 'No profile bio written yet.'}"
                  </div>

                  {data.user.stack && data.user.stack.length > 0 ? (
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">My Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.user.stack.map((tech, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-semibold uppercase">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs italic">No skills listed yet.</p>
                  )}
                </div>

                {/* Sidebar details */}
                <div className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold border-b border-white/10 pb-2 text-sm uppercase tracking-wider text-gray-400">Availability Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Clock className="w-4 h-4 text-[#FF2BD6]" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Availability</p>
                        <p className="font-bold text-xs">{data.user.availability || 'Part-time'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-[#00E5FF]" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Timezone</p>
                        <p className="font-bold text-xs">{data.user.timezone || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Target className="w-4 h-4 text-[#8C64FF]" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Preference</p>
                        <p className="font-bold text-xs">{data.user.isRemoteOnly ? 'Remote Only' : 'Remote & Local'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 text-center">
                    <Link 
                      href="/profile/edit"
                      className="inline-block text-xs font-bold text-[#00E5FF] hover:underline"
                    >
                      Update Profile Preferences →
                    </Link>
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
