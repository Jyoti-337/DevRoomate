"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, LayoutDashboard, Settings, Bell, Loader2, PlusCircle, MessageSquare } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { toast } from "sonner";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingPings, setPendingPings] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside & Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Fetch ping and unread message count
  useEffect(() => {
    if (session?.user) {
      fetch('/api/pings/count')
        .then(async res => {
          if (!res.ok) return { pendingReceived: 0 };
          const text = await res.text();
          try {
            return text ? JSON.parse(text) : { pendingReceived: 0 };
          } catch (e) {
            return { pendingReceived: 0 };
          }
        })
        .then(data => {
          if (data && data.pendingReceived) {
            setPendingPings(data.pendingReceived);
          }
        })
        .catch(() => {});

      fetch('/api/chats/unread-count')
        .then(async res => {
          if (!res.ok) return { unreadCount: 0 };
          const data = await res.json();
          return data;
        })
        .then(data => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadMessages(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [session, pathname]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      toast.success("Signed out. See you soon! 👋");
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsSigningOut(false);
    }
  };

  const handleFindDevelopers = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') {
      document.querySelector('#feed')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/developers');
    }
  };

  const handlePostRequestNav = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/requests'); // Public listing page
  };

  const dropdownItemClass = "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-[#9CA3AF] hover:text-white hover:bg-white/8 transition-all duration-150 text-sm";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${
      scrolled ? "bg-[#08080C]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.8)] border-none" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT SIDE: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 group focus:outline-none cursor-pointer">
              <span className="text-[#00E5FF] font-bold text-xl group-hover:text-[#FF2BD6] transition-colors">{"</>"}</span>
              <span className="text-xl font-bold text-white">
                Dev<span className="text-[#00E5FF]">Roommate</span>
              </span>
            </button>
          </div>

          {/* CENTER NAV LINKS */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={handleFindDevelopers}
              className="relative text-gray-300 hover:text-[#00E5FF] text-sm font-medium transition-colors group cursor-pointer"
            >
              Find Developers
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00E5FF] transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={handlePostRequestNav}
              className="relative text-gray-300 hover:text-[#00E5FF] text-sm font-medium transition-colors group cursor-pointer"
            >
              Post a Request
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00E5FF] transition-all duration-300 group-hover:w-full"></span>
            </button>
            {session?.user && (
              <button
                onClick={() => router.push('/messages')}
                className="relative text-gray-300 hover:text-[#00E5FF] text-sm font-medium transition-colors group flex items-center gap-1.5 cursor-pointer"
              >
                <span>Messages</span>
                {unreadMessages > 0 && (
                  <span className="bg-[#00E5FF] text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                    {unreadMessages}
                  </span>
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00E5FF] transition-all duration-300 group-hover:w-full"></span>
              </button>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#FF2BD6] focus:outline-none hover:ring-2 hover:ring-[#00E5FF]/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                >
                  {session.user.image ? (
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || "Avatar"} 
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-black font-bold text-lg">
                      {session.user.name?.charAt(0).toUpperCase() || "D"}
                    </span>
                  )}
                  {/* Cyan dot for online availability */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00E5FF] border-2 border-[#08080C] rounded-full"></span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+8px)] min-w-[220px] bg-[#11111A] border border-[#00E5FF]/20 rounded-xl shadow-xl shadow-black/50 backdrop-blur-md p-2"
                    >
                      {/* HEADER */}
                      <div className="px-3 py-2 cursor-default">
                        <p className="text-sm font-bold text-white truncate">
                          {session.user.name || 'Developer'}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {session.user.email}
                        </p>
                      </div>
                      <div className="border-t border-white/10 mt-2 mb-1"></div>

                      {/* ITEMS */}
                      <div 
                        className={dropdownItemClass}
                        onClick={() => { setDropdownOpen(false); router.push('/dashboard'); }}
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#00E5FF]" />
                        Dashboard
                      </div>
                      
                      <div 
                        className={dropdownItemClass}
                        onClick={() => { 
                          setDropdownOpen(false); 
                          const username = (session.user as any).username;
                          if (username) {
                            router.push('/profile/' + username);
                          } else {
                            toast("Complete your profile first");
                            router.push('/profile/edit');
                          }
                        }}
                      >
                        <User className="w-4 h-4 text-[#00E5FF]" />
                        My Profile
                      </div>
                      
                      <div 
                        className={dropdownItemClass}
                        onClick={() => { setDropdownOpen(false); router.push('/profile/edit'); }}
                      >
                        <Settings className="w-4 h-4 text-[#00E5FF]" />
                        Edit Profile
                      </div>
                      
                      <div 
                        className={dropdownItemClass}
                        onClick={() => { setDropdownOpen(false); router.push('/messages'); }}
                      >
                        <MessageSquare className="w-4 h-4 text-[#00E5FF]" />
                        <span className="flex-1">Messages</span>
                        {unreadMessages > 0 && (
                          <span className="bg-[#00E5FF] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadMessages}
                          </span>
                        )}
                      </div>

                      <div 
                        className={dropdownItemClass}
                        onClick={() => { setDropdownOpen(false); router.push('/pings'); }}
                      >
                        <Bell className="w-4 h-4 text-[#FF2BD6]" />
                        <span className="flex-1">My Pings</span>
                        {pendingPings > 0 && (
                          <span className="bg-[#FF2BD6] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {pendingPings}
                          </span>
                        )}
                      </div>

                      <div className="border-t border-white/10 my-1"></div>

                      {/* Post a Request (Create) */}
                      <div 
                        className={`${dropdownItemClass} text-[#00E5FF] hover:text-[#FF2BD6]`}
                        onClick={() => { setDropdownOpen(false); router.push('/post-request'); }}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Post a Request
                      </div>

                      <div className="border-t border-white/10 my-1"></div>

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className={`w-full ${dropdownItemClass} hover:text-red-400 hover:bg-red-500/10`}
                      >
                        {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        {isSigningOut ? 'Signing out...' : 'Sign Out'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 text-sm font-bold text-black bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] rounded-full hover:scale-105 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
