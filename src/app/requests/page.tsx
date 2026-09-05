"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, Loader2, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const PROJECT_TYPES = [
  "All", "Hackathon", "Startup MVP", "Open Source", "SaaS", 
  "Mobile App", "Web3/DeFi", "AI Project", "Game Dev"
];

export default function RequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/requests', window.location.origin);
      if (selectedType !== "All") url.searchParams.append('projectType', selectedType);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.requests) {
        const currentUserId = (session?.user as any)?.id;
        const processed = data.requests.map((r: any) => {
          const hasApplied = currentUserId && Array.isArray(r.applicants) && r.applicants.some(
            (appId: any) => (typeof appId === 'string' ? appId : appId?._id || appId?.toString()) === currentUserId
          );
          return { ...r, interestSent: Boolean(hasApplied) };
        });
        setRequests(processed);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedType, session]);


  const handleInterest = async (request: any) => {
    if (!session) {
      router.push('/login?callbackUrl=/requests');
      return;
    }

    const reqId = request.id || request._id;
    setSendingInterest(reqId);
    try {
      const res = await fetch(`/api/requests/${reqId}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send interest");
      }
      
      toast.success("Interest sent successfully! ✓");
      // Mark as sent locally
      setRequests(prev => prev.map(r => 
        (r.id === reqId || r._id === reqId) ? { ...r, interestSent: true } : r
      ));
    } catch (error: any) {
      console.error("[handleInterest Error]:", error);
      toast.error(error.message || "Could not send interest. Try again.");
    } finally {
      setSendingInterest(null);
    }
  };


  const filteredRequests = requests.filter(req => 
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#08080C] text-white selection:bg-[#00E5FF]/30 pb-20 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gradient-sweep">
              Collaboration Requests
            </h1>
            <p className="text-gray-400 text-lg">Find a project to join and build something amazing together.</p>
          </div>
          <button 
            onClick={() => router.push(session ? '/post-request' : '/login?callbackUrl=/post-request')}
            className="px-6 py-3 bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer whitespace-nowrap"
          >
            Post Your Request
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#08080C] border border-[#00E5FF]/20 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {PROJECT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedType === type 
                    ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF] mb-4" />
            <p>Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl">
            <div className="w-16 h-16 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#00E5FF]" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No requests found</h3>
            <p className="text-gray-400 mb-6 text-center max-w-md">
              There are no collaboration requests matching your current filters. 
            </p>
            <button 
              onClick={() => router.push(session ? '/post-request' : '/login')}
              className="text-[#00E5FF] hover:text-[#00E5FF]/80 font-bold cursor-pointer"
            >
              Be the first to post! →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map(req => {
              const reqId = req.id || req._id;
              const isSending = sendingInterest === reqId;
              const user = req.user || req.userId; // populated user object
              
              return (
                <div key={reqId} className="bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl p-6 hover:border-[#00E5FF]/50 transition-colors group flex flex-col h-full backdrop-blur-sm shadow-xl">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 px-3 py-1 rounded-full text-xs font-bold">
                      {req.projectType}
                    </span>
                    {req.timeline && (
                      <span className="flex items-center gap-1 bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-full text-xs">
                        <Clock className="w-3 h-3 text-[#00E5FF]" /> {req.timeline}
                      </span>
                    )}
                    {req.remoteOnly && (
                      <span className="flex items-center gap-1 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 px-3 py-1 rounded-full text-xs">
                        <MapPin className="w-3 h-3 text-[#00E5FF]" /> Remote
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <h2 className="text-xl font-bold mb-2 group-hover:text-[#00E5FF] transition-colors cursor-pointer line-clamp-2 text-white">
                    {req.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
                    {req.description}
                  </p>

                  {/* Stack & Roles */}
                  <div className="space-y-4 mb-6">
                    {req.stackNeeded && req.stackNeeded.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {req.stackNeeded.slice(0, 5).map((tech: string, i: number) => (
                            <span key={i} className="text-xs bg-[#08080C] text-[#00E5FF] px-2 py-1 rounded border border-[#00E5FF]/20 font-mono">
                              {tech}
                            </span>
                          ))}
                          {req.stackNeeded.length > 5 && (
                            <span className="text-xs bg-[#08080C] text-gray-500 px-2 py-1 rounded border border-[#00E5FF]/20 font-mono">
                              +{req.stackNeeded.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {req.roles && req.roles.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Looking for</p>
                        <div className="flex flex-wrap gap-2">
                          {req.roles.map((role: string, i: number) => (
                            <span key={i} className="text-xs bg-[#FF2BD6]/10 text-[#FF2BD6] border border-[#FF2BD6]/20 px-2 py-1 rounded-full font-semibold">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#00E5FF]/20 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#00E5FF]/20 border border-[#00E5FF]/30 relative">
                        {user?.image ? (
                          <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[#00E5FF] text-sm">
                            {user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{user?.name || "Unknown User"}</p>
                        <p className="text-xs text-gray-400">{user?.role || "Developer"}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleInterest(req)}
                      disabled={isSending || req.interestSent}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        req.interestSent 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 cursor-default'
                          : 'bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                      }`}
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
                      ) : req.interestSent ? (
                        "Interest Sent ✓"
                      ) : (
                        "I'm Interested →"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
