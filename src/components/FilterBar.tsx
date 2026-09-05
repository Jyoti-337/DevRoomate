"use client";

import { Search, MapPin, Clock, Zap, X } from "lucide-react";
import { useFilterStore } from "@/lib/filterStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounceCallback } from "usehooks-ts";
import { useEffect, useState } from "react";

const AVAILABILITY_OPTIONS = ["All", "Full-time", "Part-time", "Weekends", "Hackathons"];
const TIMEZONE_OPTIONS = ["All", "UTC-8", "UTC-5", "UTC+0", "UTC+5:30", "UTC+9"];
const PROJECT_TYPES = ["All", "Hackathon", "Startup MVP", "Open Source", "SaaS", "Mobile App"];
const CHIP_TAGS = ["Hackathon", "Startup MVP", "Open Source", "Remote Only", "Beginner Friendly"];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { search, availability, timezone, projectType, tags, setFilter, toggleTag, clearAll } = useFilterStore();
  const urlSearch = searchParams.get('search');
  const [localSearch, setLocalSearch] = useState(urlSearch || search);

  // Initialize Zustand from URL on mount
  useEffect(() => {
    const urlAvailability = searchParams.get('availability');
    const urlTimezone = searchParams.get('timezone');
    const urlProjectType = searchParams.get('projectType');
    
    if (urlSearch) {
      setFilter('search', urlSearch);
    }
    if (urlAvailability) setFilter('availability', urlAvailability);
    if (urlTimezone) setFilter('timezone', urlTimezone);
    if (urlProjectType) setFilter('projectType', urlProjectType);
  }, []);


  // Sync URL when Zustand changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set('search', search); else params.delete('search');
    if (availability !== 'All') params.set('availability', availability); else params.delete('availability');
    if (timezone !== 'All') params.set('timezone', timezone); else params.delete('timezone');
    if (projectType !== 'All') params.set('projectType', projectType); else params.delete('projectType');
    
    const qs = params.toString();
    router.replace(`?${qs}`, { scroll: false });
  }, [search, availability, timezone, projectType, router]);

  const debouncedSetSearch = useDebounceCallback((val: string) => {
    setFilter('search', val);
  }, 400);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const hasActiveFilters = search || availability !== 'All' || timezone !== 'All' || projectType !== 'All' || tags.length > 0;

  const handleClearAll = () => {
    setLocalSearch('');
    clearAll();
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-12 relative z-20">
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-[#0D0D14]/80 shadow-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search by tech stack (e.g., React, Python)..." 
            className="w-full pl-10 pr-4 py-3 bg-[#08080C] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#00E5FF] transition-colors text-white"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="relative flex-shrink-0">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={availability}
              onChange={(e) => setFilter('availability', e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#08080C] text-sm font-medium hover:border-[#00E5FF]/50 transition-colors text-gray-300 appearance-none cursor-pointer"
            >
              <option value="All" disabled className="hidden">Availability</option>
              {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="relative flex-shrink-0">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={timezone}
              onChange={(e) => setFilter('timezone', e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#08080C] text-sm font-medium hover:border-[#00E5FF]/50 transition-colors text-gray-300 appearance-none cursor-pointer"
            >
              <option value="All" disabled className="hidden">Timezone</option>
              {TIMEZONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="relative flex-shrink-0">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={projectType}
              onChange={(e) => setFilter('projectType', e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#08080C] text-sm font-medium hover:border-[#00E5FF]/50 transition-colors text-gray-300 appearance-none cursor-pointer"
            >
              <option value="All" disabled className="hidden">Project Type</option>
              {PROJECT_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-2 px-2">
        {CHIP_TAGS.map((tag) => {
          const isActive = tags.includes(tag);
          return (
            <button 
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isActive 
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'
              }`}
            >
              {tag}
            </button>
          );
        })}
        
        {hasActiveFilters && (
          <button 
            onClick={handleClearAll}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
