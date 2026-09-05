"use client";

import { motion } from "framer-motion";
import { Sparkles, Code } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FinalCTA() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleJoinNetwork = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  const handlePostRequest = () => {
    if (session) {
      router.push('/post-request');
    } else {
      router.push('/login?callbackUrl=/post-request');
    }
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden flex items-center justify-center bg-[#08080C]">
      {/* Background glow and animations */}
      <div className="absolute inset-0 max-w-5xl mx-auto flex items-center justify-center pointer-events-none">
        <div className="w-full h-full bg-[#00E5FF]/10 blur-[100px] rounded-full animate-pulse mix-blend-screen" />
        <div className="absolute w-[80%] h-[80%] bg-[#FF2BD6]/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto w-full glass-card p-12 md:p-20 text-center relative z-10 border-none shadow-[0_8px_40px_rgba(0,0,0,0.8)] overflow-hidden rounded-3xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-white to-[#FF2BD6]" />
        
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white">
          Build Faster With <br />
          <span className="text-gradient-sweep">The Right Developers</span>
        </h2>
        
        <p className="text-xl md:2xl text-gray-300 max-w-2xl mx-auto mb-12 font-light">
          Find builders who match your speed, skill, and startup ambition. Stop building alone.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={handleJoinNetwork}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_35px_rgba(0,229,255,0.45)] cursor-pointer border-none"
          >
            <Sparkles className="w-5 h-5 text-black" />
            Join the Developer Network
          </button>
          
          <button 
            onClick={handlePostRequest}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border-none text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all cursor-pointer"
          >
            <Code className="w-5 h-5 text-[#00E5FF]" />
            Post a Collaboration Request
          </button>
        </div>
      </motion.div>
    </section>
  );
}
