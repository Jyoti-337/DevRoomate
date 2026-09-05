"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Link as LinkIcon, AlertTriangle, Trash2, X } from 'lucide-react';
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader';
import { useDebounceValue } from 'usehooks-ts';
import { DEVELOPER_ROLES } from '@/lib/types';

export default function EditProfilePage() {
  const { status, update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'availability' | 'social'>('basic');
  const [formData, setFormData] = useState<any>({});
  const [isDirty, setIsDirty] = useState(false);

  // Delete account confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then(res => {
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    }),
    enabled: status === 'authenticated'
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(formData.username || '', 500);

  useEffect(() => {
    if (formData.username) {
      setDebouncedUsername(formData.username);
    }
  }, [formData.username, setDebouncedUsername]);

  const { data: usernameCheck } = useQuery({
    queryKey: ['check-username', debouncedUsername],
    queryFn: () => fetch(`/api/users/check-username?username=${debouncedUsername}`).then(r => r.json()),
    enabled: !!debouncedUsername
  });

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      if (update) {
        const safeAvatar = (formData.image && (formData.image.startsWith("data:") || formData.image.length > 200))
          ? `/api/users/${user?.id || formData.id}/avatar`
          : (formData.image || null);

        update({
          name: formData.name,
          image: safeAvatar,
          username: formData.username
        });
      }

      
      toast.success('Profile updated successfully!');
      setIsDirty(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      setIsDeleting(true);
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete account');
      }

      toast.success('Your account has been permanently deleted.');
      await signOut({ callbackUrl: '/' });
    } catch (error: any) {
      toast.error(error.message || 'Error deleting account');
      setIsDeleting(false);
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#08080C] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: val }));
    setIsDirty(true);
  };

  const commonStack = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Go', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Flutter', 'React Native'];

  const toggleStackItem = (item: string) => {
    setFormData((prev: any) => {
      const stack = prev.stack || [];
      const newStack = stack.includes(item) ? stack.filter((i: string) => i !== item) : [...stack, item];
      setIsDirty(true);
      return { ...prev, stack: newStack };
    });
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-white p-6 pb-24 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Edit Your Profile</h1>
            <p className="text-gray-400 mt-1 text-sm">Update your public presence, tech stack, and collaboration preferences.</p>
          </div>
          <Link 
            href={`/profile/${user?.username || user?.id}`}
            className="flex items-center gap-2 text-[#00E5FF] hover:text-[#00E5FF]/80 text-sm font-semibold transition-colors"
          >
            View Public Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#00E5FF]/20 overflow-x-auto no-scrollbar">
          {['basic', 'skills', 'availability', 'social'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 text-xs font-black transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab 
                  ? 'border-[#00E5FF] text-[#00E5FF]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.toUpperCase()} INFO
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="bg-[#11111A]/90 border border-[#00E5FF]/20 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative">
          
          {isDirty && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs text-amber-400 font-bold">Unsaved changes</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <ProfilePhotoUploader 
                    value={formData.image} 
                    name={formData.name} 
                    onChange={(url) => {
                      setFormData((prev: any) => ({ ...prev, image: url }));
                      setIsDirty(true);
                    }} 
                  />
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-300">Display Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm"
                          maxLength={60}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-300">Username</label>
                        <div className="relative">
                          <span className="absolute left-4 top-2.5 text-gray-500 text-sm font-mono">@</span>
                          <input
                            type="text"
                            name="username"
                            value={formData.username || ''}
                            onChange={handleChange}
                            className={`w-full bg-[#08080C] border rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm ${
                              usernameCheck?.available === false ? 'border-red-500' : 'border-[#00E5FF]/20'
                            }`}
                            maxLength={30}
                            required
                          />
                        </div>
                        {usernameCheck?.available === false && (
                          <p className="text-xs text-red-400 mt-1">Username is already taken</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-300">Role / Specialization</label>
                      <select
                        name="role"
                        value={formData.role || ''}
                        onChange={handleChange}
                        className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm"
                      >
                        <option value="" className="bg-[#08080C]">Select your primary role...</option>
                        {DEVELOPER_ROLES.map((r) => (
                          <option key={r} value={r} className="bg-[#08080C] text-white">
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-300">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell developers about yourself and your tech journey..."
                        className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm"
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 text-right">{(formData.bio || '').length}/200</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-300">Tech Stack</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.stack || []).map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded-full text-xs flex items-center gap-1.5 font-medium">
                        {tech}
                        <button type="button" onClick={() => toggleStackItem(tech)} className="hover:text-white cursor-pointer">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonStack.filter(s => !(formData.stack || []).includes(s)).map(tech => (
                      <button
                        type="button"
                        key={tech}
                        onClick={() => toggleStackItem(tech)}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        + {tech}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">Experience Level</label>
                  <div className="flex flex-wrap gap-4">
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="level"
                          value={level.toLowerCase()}
                          checked={(formData.level || '').toLowerCase() === level.toLowerCase()}
                          onChange={handleChange}
                          className="accent-[#00E5FF]"
                        />
                        <span className="text-xs text-gray-300">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">What are you looking for in a teammate?</label>
                  <textarea
                    name="lookingFor"
                    value={formData.lookingFor || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. Looking for a backend partner for a SaaS project..."
                    className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm"
                    maxLength={200}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'availability' && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-300">Current Availability</label>
                  <div className="space-y-2">
                    {[
                      { val: 'Open to collaborate', label: '🟢 Open to collaborate (actively looking)' },
                      { val: 'Part-time', label: '🟡 Part-time (a few hours/week)' },
                      { val: 'Weekends only', label: '🔵 Weekends only' },
                      { val: 'Currently unavailable', label: '⚫ Currently unavailable' }
                    ].map(opt => (
                      <label key={opt.val} className="flex items-center gap-3 p-3 rounded-xl border border-[#00E5FF]/10 bg-[#08080C]/50 hover:bg-[#08080C] cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="availability"
                          value={opt.val}
                          checked={formData.availability === opt.val}
                          onChange={handleChange}
                          className="accent-[#00E5FF]"
                        />
                        <span className="text-xs text-gray-300 font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#00E5FF]/10 bg-[#08080C]/50">
                  <input
                    type="checkbox"
                    id="isRemoteOnly"
                    name="isRemoteOnly"
                    checked={!!formData.isRemoteOnly}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#00E5FF] rounded"
                  />
                  <label htmlFor="isRemoteOnly" className="text-xs text-gray-300 cursor-pointer">
                    Remote only (I'm not looking for local/in-person collaboration)
                  </label>
                </div>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-[#00E5FF]"/> GitHub URL</label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl || ''}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-[#1DA1F2]"/> Twitter / X URL</label>
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl || ''}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                    className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-[#0A66C2]"/> LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl || ''}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00E5FF] text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-[#00E5FF]/20 flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending || !isDirty || usernameCheck?.available === false}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>

        {/* DANGER ZONE: ACCOUNT DELETION */}
        <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Danger Zone
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Permanently delete your DevRoommate account, messages, pings, and profile data. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>

      </div>

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#11111A] border border-red-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-extrabold text-white mb-2">Delete Account Permanently</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                This will permanently remove your profile, saved pings, chat history, and messages from DevRoommate. You will not be able to recover this account.
              </p>

              <div className="space-y-3 mb-6">
                <label className="text-xs font-bold text-gray-300">
                  Type <span className="text-red-400 font-mono">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#08080C] border border-red-500/40 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-400 text-sm font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText.trim() !== 'DELETE' || isDeleting}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deletion'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
