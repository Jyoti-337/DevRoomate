"use client";

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface ProfileCompletionProps {
  user: UserProfile;
}

export default function ProfileCompletion({ user }: ProfileCompletionProps) {
  const router = useRouter();


  // Calculate completion
  const fields = [
    { key: 'name', weight: 10, label: 'Add your name', tab: 'basic' },
    { key: 'bio', weight: 15, label: 'Write a bio', tab: 'basic' },
    { key: 'stack', weight: 15, label: 'Add tech stack', tab: 'skills' },
    { key: 'timezone', weight: 10, label: 'Set timezone', tab: 'availability' },
    { key: 'availability', weight: 10, label: 'Set availability', tab: 'availability' },
    { key: 'lookingFor', weight: 10, label: 'Add what you are looking for', tab: 'skills' },
    { key: 'githubUrl', weight: 10, label: 'Link GitHub', tab: 'social' },
    { key: 'image', weight: 10, label: 'Upload photo', tab: 'basic' },
    { key: 'projectType', weight: 10, label: 'Select project types', tab: 'skills' },
  ];

  let score = 0;
  const missingFields: { label: string; tab: string }[] = [];

  fields.forEach(field => {
    const value = user[field.key as keyof UserProfile];
    const isCompleted = Array.isArray(value) ? value.length > 0 : !!value;
    
    if (isCompleted) {
      score += field.weight;
    } else {
      missingFields.push({ label: field.label, tab: field.tab });
    }
  });

  if (score === 100) {
    return (
      <div className="w-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-[#00E5FF] mb-2">Profile complete! You're getting more visibility 🚀</h3>
        <p className="text-sm text-[#00E5FF]/80">Your profile is 100% optimized for matches.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#11111A]/90 border border-[#00E5FF]/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-xl font-bold text-white">Complete Your Profile</h3>
        <span className="text-[#00E5FF] font-bold">{score}%</span>
      </div>
      
      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-6 overflow-hidden">
        <motion.div 
          className="bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}

        />
      </div>

      {missingFields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {missingFields.slice(0, 4).map((field, i) => (
            <button
              key={i}
              onClick={() => router.push(`/profile/edit?tab=${field.tab}`)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors flex items-center gap-1 group cursor-pointer"
            >
              {field.label}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#00E5FF]" />
            </button>
          ))}
          {missingFields.length > 4 && (
            <span className="text-xs px-3 py-1.5 text-gray-500 flex items-center">
              + {missingFields.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
