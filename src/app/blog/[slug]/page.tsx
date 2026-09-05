"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { BlogPost } from "@/app/api/blog/route";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchPostDetails = async () => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto flex-1 w-full">
        {/* Navigation back */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00E5FF] transition-colors mb-10 text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#00E5FF]" /> Back to All Guides
        </Link>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
            <p className="text-gray-400 text-sm">Retrieving article details...</p>
          </div>
        )}

        {/* ERROR / 404 STATE */}
        {!loading && (error || !post) && (
          <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-6 bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Article Not Found</h2>
              <p className="text-gray-400 text-sm mt-2">
                The article slug you specified could not be found or has been moved to a different location.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/blog"
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Return to Blog
              </Link>
              <button
                onClick={fetchPostDetails}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black text-sm transition-opacity flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* BLOG CONTENT */}
        {!loading && !error && post && (
          <article className="space-y-8 animate-fade-in">
            {/* Header Metadata */}
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00E5FF]/10 text-[#00E5FF] rounded-full text-xs font-black border border-[#00E5FF]/30 shadow-md">
                {post.tag}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
                {post.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-[#00E5FF]/20 py-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00E5FF]/30 shadow-md">
                    <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">{post.author.name}</div>
                    <div className="text-xs text-gray-400">{post.author.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#00E5FF]" />
                    <span>{post.readTime}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-[#00E5FF]/40" />
                  <div>{post.date}</div>
                </div>
              </div>
            </header>

            {/* Banner Cover Image */}
            <div className="relative w-full h-64 md:h-[400px] rounded-3xl overflow-hidden glass-card border border-[#00E5FF]/30 shadow-2xl">
              {!imageError ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : null}
              {imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 via-[#FF2BD6]/10 to-[#08080C] flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-white/5" />
                </div>
              )}
            </div>

            {/* Markdown Post Body Content */}
            <div className="prose prose-invert prose-lg max-w-none prose-a:text-[#00E5FF] hover:prose-a:text-[#00E5FF]/80 prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h3:text-2xl prose-h3:mt-8 prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-gray-300 prose-blockquote:border-l-4 prose-blockquote:border-[#00E5FF] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-white prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-xl">
              {post.content.split("\n\n").map((paragraph, index) => {
                const cleanPara = paragraph.trim();
                if (!cleanPara) return null;

                // Handle blockquote
                if (cleanPara.startsWith(">")) {
                  const quoteText = cleanPara.replace(/^>\s*"/, "").replace(/"$/, "").replace(/^>\s*/, "");
                  return (
                    <blockquote key={index}>
                      <p>"{quoteText}"</p>
                    </blockquote>
                  );
                }

                // Handle H2 / H3 headings
                if (cleanPara.startsWith("###")) {
                  return <h3 key={index} className="text-xl font-bold text-white mt-8 mb-4">{cleanPara.replace("###", "").trim()}</h3>;
                }
                if (cleanPara.startsWith("##")) {
                  return <h2 key={index} className="text-2xl font-bold text-white mt-12 mb-4">{cleanPara.replace("##", "").trim()}</h2>;
                }

                // Handle bullet lists
                if (cleanPara.startsWith("1.") || cleanPara.startsWith("*")) {
                  const lines = cleanPara.split("\n").map(l => l.trim()).filter(Boolean);
                  return (
                    <ul key={index} className="list-disc pl-6 space-y-2 mt-4 mb-4">
                      {lines.map((line, i) => {
                        const cleanLine = line.replace(/^\d+\.\s*/, "").replace(/^\*\s*/, "");
                        return <li key={i}>{cleanLine}</li>;
                      })}
                    </ul>
                  );
                }

                return <p key={index} className="mb-6">{cleanPara}</p>;
              })}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
