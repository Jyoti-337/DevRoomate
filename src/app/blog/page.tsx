"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, BookOpen, RefreshCw } from "lucide-react";
import Image from "next/image";
import { BlogPost } from "@/app/api/blog/route";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex-1 w-full">
        {/* Page Header */}
        <div className="mb-16">
          <span className="px-3 py-1.5 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-black uppercase tracking-wider">
            Resources & Guides
          </span>
          <h1 className="text-5xl font-bold tracking-tight mb-4 mt-4 text-white">The Dev Roommate Blog</h1>
          <p className="text-xl text-gray-400">Insights on engineering, startups, and remote collaboration.</p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card flex flex-col h-full bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl overflow-hidden animate-pulse">
                {/* Image Skeleton */}
                <div className="h-48 bg-white/5 relative overflow-hidden" />
                
                {/* Content Skeleton */}
                <div className="p-6 flex flex-col flex-1 space-y-4">
                  <div className="h-4 w-1/3 bg-white/5 rounded" />
                  <div className="h-6 w-full bg-white/5 rounded" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                  <div className="h-4 w-4/5 bg-white/5 rounded" />
                  
                  {/* Author Skeleton */}
                  <div className="mt-auto border-t border-white/5 pt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="h-4 w-1/4 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-6 bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Failed to Load Blog Posts</h2>
              <p className="text-gray-400 text-sm mt-2">
                We ran into a connection error while trying to fetch the latest guides. Please check your network and try again.
              </p>
            </div>
            <button
              onClick={fetchPosts}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black flex items-center gap-2 mx-auto shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Loading
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && posts.length === 0 && (
          <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-6 bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl">
            <div className="w-16 h-16 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-[#00E5FF]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">No Articles Found</h2>
              <p className="text-gray-400 text-sm mt-2">
                There are currently no blog posts available. Check back soon for fresh insights and community resources!
              </p>
            </div>
          </div>
        )}

        {/* POSTS LISTING */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <Link 
      href={`/blog/${post.slug}`} 
      className="glass-card group hover:-translate-y-1.5 hover:border-[#00E5FF]/50 transition-all duration-300 flex flex-col h-full bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Blog cover image */}
      <div className="h-48 bg-[#08080C] relative overflow-hidden border-b border-white/5">
        {!imageError ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-w-768px) 100vw, 33vw"
            className={`object-cover group-hover:scale-105 transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : null}
        
        {/* Dynamic color overlay overlaying a dark gradient if image fails or is loading */}
        {(!loaded || imageError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 via-[#FF2BD6]/10 to-[#08080C] mix-blend-overlay flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/10" />
          </div>
        )}

        <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur text-[#00E5FF] text-xs font-bold rounded-full border border-[#00E5FF]/30 shadow-md">
          {post.tag}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-[#00E5FF]/50" />
          <span>{post.readTime}</span>
        </div>
        
        <h2 className="text-xl font-bold mb-3 group-hover:text-[#00E5FF] transition-colors line-clamp-2 leading-snug text-white">
          {post.title}
        </h2>
        <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
          {post.excerpt}
        </p>
        
        {/* Card Footer Author Profile */}
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#00E5FF]/30">
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">{post.author.name}</span>
              <span className="text-[10px] text-gray-400">{post.author.role.split(' @ ')[0]}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#00E5FF]/20 flex items-center justify-center text-gray-400 group-hover:text-[#00E5FF] transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
