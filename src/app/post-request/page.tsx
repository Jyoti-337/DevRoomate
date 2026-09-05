"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";

const PROJECT_TYPES = [
  "Hackathon", "Startup MVP", "Open Source", "SaaS", 
  "Mobile App", "Web3/DeFi", "AI Project", "Game Dev"
];

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full-Stack Developer", 
  "UI/UX Designer", "Mobile Developer", "DevOps / Cloud", 
  "AI/ML Engineer", "Web3 / Solidity Dev", "Technical Co-founder", "Open to anyone"
];

const SUGGESTED_STACK = [
  "React", "Next.js", "Node.js", "Python", "TypeScript", 
  "PostgreSQL", "MongoDB", "Flutter", "Solidity", "TailwindCSS", "FastAPI", "Docker"
];

export default function PostRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    projectType: "",
    description: "",
    stackNeeded: [] as string[],
    roles: [] as string[],
    level: "Any Level",
    timeline: "",
    remoteOnly: true,
    contactPreference: "Via Ping"
  });
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#08080C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/post-request");
    return null;
  }

  const handleAddTag = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter' && e.key !== ',') return;
    e?.preventDefault();
    
    const tag = currentTag.trim().replace(/,$/, '');
    if (tag && !formData.stackNeeded.includes(tag) && formData.stackNeeded.length < 10) {
      setFormData(prev => ({ ...prev, stackNeeded: [...prev.stackNeeded, tag] }));
    }
    setCurrentTag("");
  };

  const addSuggestedTag = (tag: string) => {
    if (!formData.stackNeeded.includes(tag) && formData.stackNeeded.length < 10) {
      setFormData(prev => ({ ...prev, stackNeeded: [...prev.stackNeeded, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      stackNeeded: prev.stackNeeded.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title || formData.title.length < 10) newErrors.title = "Title must be at least 10 characters";
    if (!formData.projectType) newErrors.projectType = "Please select a project type";
    if (!formData.description || formData.description.length < 50) newErrors.description = "Description must be at least 50 characters";
    if (formData.roles.length === 0) newErrors.roles = "Please select at least one role";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = Object.values(errors)[0] || "Please check the highlighted fields in the form";
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post request");
      }

      toast.success("Request posted! Developers can now find you 🚀");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-white selection:bg-[#00E5FF]/30 font-sans">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-24">
        {/* Header */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#00E5FF] transition-colors mb-6 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#00E5FF]" /> Back
        </button>

        <h1 className="text-3xl font-bold mb-2 text-white">Post a Collaboration Request</h1>
        <p className="text-gray-400 mb-8">Tell 5,000+ builders what you're working on and who you need.</p>

        {session?.user && (
          <div className="flex items-center gap-3 mb-8 bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-xl p-4 w-fit">
            <div className="w-8 h-8 rounded-full overflow-hidden relative bg-[#00E5FF]/20 border border-[#00E5FF]/30">
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-[#00E5FF] text-xs">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Posting as </span>
              <span className="font-semibold text-white">{session.user.name}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-8 space-y-8 backdrop-blur-md">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Project Title *</label>
            <input 
              type="text" 
              maxLength={100}
              placeholder="e.g. AI-powered recipe recommendation app"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={`w-full bg-[#08080C] border ${errors.title ? 'border-red-500' : 'border-[#00E5FF]/20'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors`}
            />
            <div className="flex justify-between mt-1">
              {errors.title ? <span className="text-red-500 text-xs">{errors.title}</span> : <span></span>}
              <span className="text-xs text-gray-500">{formData.title.length}/100</span>
            </div>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium mb-3 text-white">Project Type *</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, projectType: type})}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border cursor-pointer ${
                    formData.projectType === type 
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.projectType && <p className="text-red-500 text-xs mt-2">{errors.projectType}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">What are you building? *</label>
            <textarea 
              rows={5}
              maxLength={500}
              placeholder="Describe your project idea, current progress, and what you hope to achieve. The more detail, the better your matches will be."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full bg-[#08080C] border ${errors.description ? 'border-red-500' : 'border-[#00E5FF]/20'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors resize-none`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? <span className="text-red-500 text-xs">{errors.description}</span> : <span></span>}
              <span className={`text-xs ${500 - formData.description.length < 50 ? 'text-red-400' : 'text-gray-500'}`}>
                {formData.description.length}/500
              </span>
            </div>
          </div>

          {/* Tech Stack Needed */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Tech Stack Needed</label>
            <input 
              type="text" 
              placeholder="Type and press Enter (max 10)"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors mb-3"
            />
            
            {/* Selected Tags */}
            {formData.stackNeeded.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.stackNeeded.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded-full px-3 py-1 text-sm font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white cursor-pointer">&times;</button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_STACK.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSuggestedTag(tag)}
                  className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Roles Looking For */}
          <div>
            <label className="block text-sm font-medium mb-3 text-white">Roles Looking For *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map(role => (
                <label key={role} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-4 h-4 rounded border-[#00E5FF]/30 text-[#00E5FF] focus:ring-[#00E5FF]/50 bg-transparent"
                  />
                  <span className="text-sm text-gray-300">{role}</span>
                </label>
              ))}
            </div>
            {errors.roles && <p className="text-red-500 text-xs mt-2">{errors.roles}</p>}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium mb-3 text-white">Experience Level Wanted</label>
            <div className="flex flex-wrap gap-4">
              {["Any Level", "Beginner", "Intermediate", "Advanced"].map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="level"
                    value={level}
                    checked={formData.level === level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="text-[#00E5FF] focus:ring-[#00E5FF] bg-transparent border-white/20"
                  />
                  <span className="text-sm text-gray-300">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium mb-3 text-white">Project Timeline</label>
            <div className="flex flex-wrap gap-2">
              {["< 1 Week", "1 Month", "3 Months", "6 Months", "Ongoing"].map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData({...formData, timeline: time})}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border cursor-pointer ${
                    formData.timeline === time 
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Remote Only */}
          <div className="flex items-center justify-between py-4 border-t border-white/10">
            <div>
              <p className="font-medium text-white">Remote Only</p>
              <p className="text-sm text-gray-400">Only looking for remote collaborators</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({...formData, remoteOnly: !formData.remoteOnly})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${formData.remoteOnly ? 'bg-[#00E5FF]' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.remoteOnly ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Contact Preference */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium mb-3 text-white">How should people reach you?</label>
            <div className="flex flex-wrap gap-4">
              {["Via Ping", "GitHub", "Email"].map(pref => (
                <label key={pref} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="contact"
                    value={pref}
                    checked={formData.contactPreference === pref}
                    onChange={(e) => setFormData({...formData, contactPreference: e.target.value})}
                    className="text-[#00E5FF] focus:ring-[#00E5FF] bg-transparent border-white/20"
                  />
                  <span className="text-sm text-gray-300">{pref}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-full text-white font-medium bg-transparent border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-black font-black bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Request →"
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
