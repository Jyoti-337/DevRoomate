"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useFilterStore } from "@/lib/filterStore";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Users, Frown } from "lucide-react";
import DeveloperCard from "./DeveloperCard";
import { useMemo, useState, useEffect } from "react";

import { motion } from "framer-motion";

export default function DeveloperFeed() {
  const { search, availability, timezone, projectType, tags } = useFilterStore();
  const [pages, setPages] = useState<number[]>([1]);

  // Construct query string based on exact Zustand store contents
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (availability && availability !== 'All') params.set('availability', availability);
    if (timezone && timezone !== 'All') params.set('timezone', timezone);
    
    // Convert tags into mapped parameters
    const mappedTypes: string[] = [];
    if (projectType && projectType !== 'All') mappedTypes.push(projectType);
    if (tags.includes('Hackathon')) mappedTypes.push('hackathon');
    if (tags.includes('Startup MVP')) mappedTypes.push('startup');
    if (tags.includes('Open Source')) mappedTypes.push('opensource');
    if (mappedTypes.length > 0) params.set('projectType', mappedTypes.join(','));
    
    if (tags.includes('Remote Only')) params.set('isRemoteOnly', 'true');
    if (tags.includes('Beginner Friendly')) params.set('level', 'beginner');

    return params.toString();
  }, [search, availability, timezone, projectType, tags]);

  const { data, isLoading, isError } = useQuery<{users: any[], hasMore: boolean}>({
    queryKey: ['developers', queryString, pages],
    queryFn: async () => {
      // Fetch all required pages (since it's a simple append locally approach for UX without infinite queries library here)
      const fetches = pages.map(page => 
        fetch(`/api/users?page=${page}&${queryString}`).then(res => res.json())
      );
      const results = await Promise.all(fetches);
      
      // Merge results
      const allUsers = results.flatMap(r => r.users || []);
      const lastResult = results[results.length - 1] || {};
      
      return {
        users: allUsers,
        hasMore: !!lastResult.hasMore
      };
    },
    placeholderData: keepPreviousData,
  });

  const handleLoadMore = () => {
    setPages(prev => [...prev, prev[prev.length - 1] + 1]);
  };

  // Reset pages when filters change
  useEffect(() => {
    setPages([1]);
  }, [queryString]);

  return (
    <section id="feed" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row items-baseline justify-between mb-12"
      >
        <div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Live Collaboration Feed
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-xl">
            Swipe through developers actively looking for partners right now.
          </p>
        </div>
      </motion.div>

      {isLoading && pages.length === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 h-[350px] animate-pulse flex flex-col justify-between">
               <div className="flex items-start gap-4">
                 <div className="w-16 h-16 rounded-full bg-border-primary" />
                 <div className="flex-1 space-y-2 py-1">
                   <div className="h-4 bg-border-primary rounded w-1/2" />
                   <div className="h-3 bg-border-primary rounded w-1/3" />
                 </div>
               </div>
               <div className="h-10 bg-border-primary rounded w-full mt-4" />
               <div className="flex gap-2 mt-4"><div className="h-6 bg-border-primary rounded w-16"/><div className="h-6 bg-border-primary rounded w-16"/></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Frown className="w-12 h-12 text-error mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to load developers</h3>
          <p className="text-text-secondary">Please try again later.</p>
        </div>
      ) : data?.users?.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border-primary rounded-2xl bg-background-secondary/30">
          <Users className="w-12 h-12 text-text-secondary mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No developers found</h3>
          <p className="text-text-secondary">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.users?.map((dev: any, i: number) => (
              <DeveloperCard key={`${dev.id}-${i}`} dev={dev} index={i} />
            ))}
          </div>

          {data?.hasMore && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={handleLoadMore}
                className="px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all hover:scale-105"
              >
                Load More Developers
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
