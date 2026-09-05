"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UserAvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
    avatar?: string | null; // For Mongoose backwards compatibility
    availability?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-3xl',
};

const dotSizeClasses = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-5 h-5',
};

export default function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const [error, setError] = useState(false);
  const imageUrl = !error && (user.image || user.avatar);
  const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  const getStatusColor = (availability?: string) => {
    if (!availability) return 'bg-gray-500';
    const lower = availability.toLowerCase();
    if (lower.includes('open') || lower.includes('full')) return 'bg-[#00E5FF]';
    if (lower.includes('part') || lower.includes('hackathon')) return 'bg-[#FF2BD6]';
    return 'bg-gray-500';
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center overflow-hidden font-bold text-black border border-[#00E5FF]/30",
          sizeClasses[size],
          !imageUrl && "bg-gradient-to-br from-[#00E5FF] to-[#FF2BD6] shadow-[0_0_15px_rgba(0,229,255,0.3)]"
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={user.name || 'User avatar'}
            width={96}
            height={96}
            className="object-cover w-full h-full"
            onError={() => setError(true)}
            unoptimized
          />
        ) : (
          initials
        )}
      </div>

      {user.availability && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[#08080C]",
            getStatusColor(user.availability),
            dotSizeClasses[size]
          )}
          title={user.availability}
        />
      )}
    </div>
  );
}
