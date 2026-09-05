"use client";

import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import PingModal from "./PingModal";
import UserAvatar from "./UserAvatar";

interface DeveloperCardProps {
  dev: any;
  index: number;
}

export default function DeveloperCard({ dev, index }: DeveloperCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [isPinged, setIsPinged] = useState(false);
  const [pingHoverStatus, setPingHoverStatus] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if we're not clicking on the ping button/area
    const target = e.target as HTMLElement;
    if (!target.closest('.ping-action-area')) {
      router.push(`/profile/${dev.username}`);
    }
  };

  const handlePingAction = () => {
    if (!session) {
      router.push('/login?callbackUrl=/developers');
      return;
    }
    setIsPingModalOpen(true);
  };

  const handlePingSuccess = () => {
    setIsPinged(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.1 }}
        onClick={handleCardClick}
        className="h-full bg-[#11111A]/80 hover:bg-[#161622] border-none rounded-2xl p-6 flex flex-col group transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(0,229,255,0.3)] cursor-pointer backdrop-blur-xl relative overflow-hidden"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <UserAvatar user={dev} size="lg" />
            {(dev.online !== false) && (
              <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00E5FF] border-2 border-[#11111A]"></span>
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5 leading-tight group-hover:text-[#00E5FF] transition-colors">
                  <span className="truncate">{dev.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                </h3>
                <p className="text-gray-400 text-xs font-medium truncate mt-0.5">{dev.role}</p>
              </div>
              <div className="px-2.5 py-1 bg-gradient-to-r from-[#00E5FF]/20 to-[#FF2BD6]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded-full text-[10px] font-black flex-shrink-0 tracking-wider">
                {dev.matchPercentage}% MATCH
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 h-12 flex items-center">
          <p className="text-xs border-l-2 border-[#00E5FF]/60 pl-3 py-0.5 text-gray-300 italic line-clamp-2 leading-relaxed">
            "{dev.bio || `Looking for exciting ${dev.projectType?.[0] || 'projects'}`}"
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6 h-16 overflow-hidden content-start">
          {(dev.techStack || dev.stack || []).slice(0, 5).map((s: string) => (
            <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-[11px] font-medium group-hover:border-[#00E5FF]/30 transition-colors">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mb-5">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Timezone</span>
            <span className="text-xs font-medium text-gray-300 truncate">{dev.timezone}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Availability</span>
            <span className="text-xs font-medium text-gray-300 truncate">{dev.availability}</span>
          </div>
        </div>

        <div 
          className="relative ping-action-area"
          onMouseEnter={() => setPingHoverStatus(true)}
          onMouseLeave={() => setPingHoverStatus(false)}
        >
          {!session && pingHoverStatus && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs bg-[#11111A] border border-[#00E5FF]/30 rounded-lg shadow-lg text-white font-medium z-20">
              Log in to send ping requests
            </div>
          )}
          
          <button 
            onClick={handlePingAction}
            disabled={isPinged}
            className={`w-full py-2.5 rounded-xl transition-all duration-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
              isPinged 
                ? "bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] cursor-not-allowed" 
                : "bg-white/10 hover:bg-gradient-to-r hover:from-[#00E5FF] hover:to-[#FF2BD6] text-white hover:text-black border border-white/20 hover:border-transparent shadow-lg"
            }`}
          >
            {isPinged ? "Request Sent ✓" : (
              <>Send Ping Request <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </motion.div>

      {isPingModalOpen && (
        <PingModal 
          isOpen={isPingModalOpen} 
          onClose={() => setIsPingModalOpen(false)} 
          developer={dev}
          onSuccess={handlePingSuccess}
        />
      )}
    </>
  );
}
