"use client";

import { motion } from "framer-motion";
import { Search, Rocket, ChevronRight, CheckCircle2, AlertTriangle, Radio } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PingModal from "./PingModal";
import HeroBackgroundCanvas from "./HeroBackgroundCanvas";
import AerospaceMotifs from "./AerospaceMotifs";
import MagneticButton from "./MagneticButton";
import TiltCard from "./TiltCard";
import AnimatedCounter from "./AnimatedCounter";
import LiveMarquee from "./LiveMarquee";

export default function HeroSection() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [isStartingRoute, setIsStartingRoute] = useState(false);
  const [selectedDev, setSelectedDev] = useState<any>(null);
  const [pingedDevs, setPingedDevs] = useState<string[]>([]);
  const [pingHoverDevId, setPingHoverDevId] = useState<string | null>(null);
  const [dbDevs, setDbDevs] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [errorDb, setErrorDb] = useState<string | null>(null);

  const fetchDevelopers = async (active = true) => {
    try {
      setLoadingDb(true);
      setErrorDb(null);
      const res = await fetch("/api/users?limit=3");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch developers (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (active) {
        setDbDevs(data.users || []);
      }
    } catch (err: any) {
      if (active) {
        console.error("HeroSection error loading developers:", err);
        setErrorDb(err.message || "Failed to fetch developers");
      }
    } finally {
      if (active) {
        setLoadingDb(false);
      }
    }
  };

  useEffect(() => {
    let active = true;
    fetchDevelopers(active);

    return () => {
      active = false;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const easeSaaS = [0.16, 1, 0.3, 1] as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7, 
        ease: easeSaaS 
      } 
    },
  };

  const handleStartFinding = () => {
    setIsStartingRoute(true);
    if (session) {
      router.push('/developers');
    } else {
      router.push('/signup');
    }
  };

  const handleExplore = () => {
    document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePingClick = (dev: any) => {
    if (!session) {
      router.push('/login?callbackUrl=/developers');
    } else {
      setSelectedDev(dev);
    }
  };

  const handlePingSuccess = () => {
    if (selectedDev) {
      setPingedDevs(prev => [...prev, selectedDev.id]);
    }
  };

  return (
    <>
      <section className="relative min-h-[calc(100vh-80px)] pt-28 pb-12 flex flex-col justify-between overflow-hidden bg-[#050505]">
        {/* Icy Blue Particle Canvas Background */}
        <HeroBackgroundCanvas />

        {/* SCI-FI SPACE MOTIFS */}
        <AerospaceMotifs />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Asymmetric Left Composition Column */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-7 flex flex-col justify-center relative z-10"
            >
              {/* Quiet Icy Blue Badge Pills */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7DD3FC]/10 border border-[#7DD3FC]/20 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7DD3FC] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7DD3FC]"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wide text-[#7DD3FC]">
                    Over <AnimatedCounter to={5000} /> Active Builders
                  </span>
                </motion.div>

                <motion.div variants={itemVariants} className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-gray-300">
                  <Radio className="w-3.5 h-3.5 text-[#7DD3FC] animate-pulse" />
                  <span>AI Tech-Match Console v2.4</span>
                </motion.div>
              </div>

              {/* Main Dynamic Headline with Signature Aurora Gradient */}
              <motion.h1 
                variants={itemVariants} 
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-white"
              >
                Find Your Ideal <br />
                <span className="text-gradient-aurora drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                  Dev Roommate
                </span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-normal">
                Skip solo grinding. Partner with verified developers matching your stack, timezone, and project vision for hackathons, SaaS startups, and open-source software.
              </motion.p>

              {/* Interactive Magnetic CTAs - Signature Aurora Gradient Primary CTA */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
                <MagneticButton strength={0.3}>
                  <button 
                    onClick={handleStartFinding}
                    disabled={isStartingRoute}
                    className="group w-full sm:w-auto relative flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-aurora hover:bg-gradient-aurora-hover text-white font-extrabold hover:scale-[1.02] transition-all shadow-[0_0_35px_rgba(139,92,246,0.35)] disabled:opacity-75 cursor-pointer text-sm border-none"
                  >
                    {isStartingRoute ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Rocket className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white" />
                    )}
                    <span>Start Finding Teammates</span>
                  </button>
                </MagneticButton>

                <MagneticButton strength={0.2}>
                  <button 
                    onClick={handleExplore}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-semibold transition-all backdrop-blur-md cursor-pointer text-sm border border-white/10 hover:border-white/20"
                  >
                    <Search className="w-5 h-5 text-[#7DD3FC]" />
                    Explore Developers
                  </button>
                </MagneticButton>
              </motion.div>

              {/* Developer Community Social Proof */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 pt-4 border-t border-white/10 max-w-xl">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img 
                      key={i} 
                      src={`https://i.pravatar.cc/150?img=${i + 15}`} 
                      alt="Builder avatar" 
                      className="w-10 h-10 rounded-full border border-black relative z-10 hover:z-20 transition-transform hover:scale-110 object-cover shadow-lg" 
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full relative z-10 bg-[#0D0E15] border border-[#7DD3FC]/30 flex items-center justify-center text-xs font-bold text-[#7DD3FC] shadow-md">
                    +1.2k
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-[#7DD3FC] text-xs">★</span>
                    ))}
                    <span className="text-xs font-bold text-white ml-1">4.9/5</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Trusted by indie hackers & hackathon winners</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Asymmetric Right Column - Quiet Developer Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: easeSaaS }}
              className="lg:col-span-5 flex flex-col justify-center items-center lg:items-end relative z-10"
            >
              <div className="relative w-full max-w-md space-y-4">

                {/* Radar-Sweep Conic Gradient Scanner */}
                <div className="absolute -inset-8 pointer-events-none overflow-hidden rounded-full opacity-20 z-0">
                  <div className="w-full h-full animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(125,211,252,0.25)_360deg)] rounded-full blur-2xl" />
                </div>
                
                {loadingDb ? (
                  [0, 1, 2].map((i) => (
                    <div key={i} className="h-40 bg-white/5 border border-white/5 rounded-2xl animate-pulse flex items-center justify-center p-5">
                      <div className="flex gap-4 w-full items-start">
                        <div className="w-14 h-14 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-3 py-1">
                          <div className="h-4 bg-white/10 rounded w-3/4" />
                          <div className="h-3 bg-white/10 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : errorDb && dbDevs.length === 0 ? (
                  <div className="card-quiet p-8 text-center rounded-3xl shadow-2xl relative z-10 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-400">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Unable to load developers</h3>
                    <p className="text-gray-400 text-xs max-w-xs mb-4">{errorDb}</p>
                    <button 
                      onClick={() => fetchDevelopers(true)}
                      className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all text-xs cursor-pointer border-none"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : dbDevs.length > 0 ? (
                  dbDevs.map((dev: any, i: number) => {
                    const isPinged = pingedDevs.includes(dev.id);
                    return (
                      <TiltCard key={dev.id} maxTilt={8}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: i * 0.15 }}
                          className="bg-[#0B0D14]/90 p-5 rounded-2xl backdrop-blur-xl border border-white/10 hover:border-[#7DD3FC]/30 transition-all duration-300 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.8)] cursor-pointer"
                        >
                          <div className="relative z-10 flex items-start gap-4">
                            {/* Avatar with Status Indicator */}
                            <div className="relative flex-shrink-0">
                              <img 
                                src={dev.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                                alt={dev.name} 
                                className="w-14 h-14 rounded-full border border-white/10 object-cover shadow-md" 
                              />
                              {dev.online !== false && (
                                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7DD3FC] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#7DD3FC]"></span>
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="font-bold text-white leading-tight flex items-center gap-1.5 truncate text-base">
                                    {dev.name} 
                                    <CheckCircle2 className="w-4 h-4 text-[#7DD3FC] flex-shrink-0" />
                                  </h3>
                                  <p className="text-xs text-gray-400 truncate mt-0.5">{dev.role}</p>
                                </div>
                                {/* Match % Badge: Signature Aurora Moment */}
                                <div className="px-2.5 py-1 bg-gradient-aurora text-white rounded-full text-[10px] font-black tracking-wider flex-shrink-0 border-none shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                                  {dev.matchPercentage}% MATCH
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {(dev.techStack || dev.stack || []).slice(0, 3).map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-gray-300 font-medium border border-white/5">
                                    {s}
                                  </span>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-3 relative">
                                <div className="text-[10px] text-gray-400 flex items-center gap-3 font-medium">
                                  <span>{dev.timezone || "UTC-8"}</span>
                                  <span>•</span>
                                  <span>{dev.availability || "Part-time"}</span>
                                </div>
                                
                                <div 
                                  className="relative"
                                  onMouseEnter={() => setPingHoverDevId(dev.id)}
                                  onMouseLeave={() => setPingHoverDevId(null)}
                                >
                                  {!session && pingHoverDevId === dev.id && (
                                    <div className="absolute bottom-full right-0 mb-2 w-max px-2.5 py-1 text-[10px] bg-[#0A0C12] rounded shadow-xl text-white font-medium z-20 border border-white/10">
                                      Sign in to ping developers
                                    </div>
                                  )}

                                  <button 
                                    onClick={() => handlePingClick(dev)}
                                    disabled={isPinged}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-none ${
                                      isPinged 
                                        ? "bg-[#7DD3FC]/20 text-[#7DD3FC] cursor-not-allowed" 
                                        : "bg-white/10 hover:bg-[#7DD3FC] text-white hover:text-black shadow-[0_0_15px_rgba(125,211,252,0.2)]"
                                    }`}
                                  >
                                    {isPinged ? "Pinged ✓" : (
                                      <>Ping <ChevronRight className="w-3.5 h-3.5" /></>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </TiltCard>
                    );
                  })
                ) : null}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Live Ecosystem Tech-Stack Marquee Ticker */}
        <div className="mt-12 w-full z-10">
          <LiveMarquee />
        </div>
      </section>

      {selectedDev && (
        <PingModal 
          isOpen={!!selectedDev} 
          onClose={() => setSelectedDev(null)} 
          developer={selectedDev}
          onSuccess={handlePingSuccess}
        />
      )}
    </>

  );
}
