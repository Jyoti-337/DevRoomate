"use client";

import React from "react";

export default function AerospaceMotifs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2] select-none">
      
      {/* ========================================================================= */}
      {/* 1. ICY BLUE PLANET WITH SIGNATURE AURORA ORBITAL RING (Top Right Viewport) */}
      {/* ========================================================================= */}
      <div className="absolute top-[6%] right-[4%] w-48 h-48 opacity-65 hidden md:block">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Planet Atmospheric Outer Glow */}
          <div className="absolute w-32 h-32 rounded-full bg-[#7DD3FC]/15 blur-xl animate-pulse" style={{ animationDuration: "5s" }} />
          
          {/* Planet Spherical Body */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E0F2FE]/20 via-[#38BDF8]/20 to-[#05050A] shadow-[inset_-8px_-8px_20px_rgba(0,0,0,0.95),0_0_20px_rgba(125,211,252,0.3)] relative z-10 border border-[#7DD3FC]/20" />
          
          {/* Outer Orbital Ring 1 (Signature Aurora Gradient Moment) */}
          <div className="absolute w-44 h-14 border-2 border-transparent rounded-[100%] transform -rotate-[22deg] z-20 shadow-[0_0_15px_rgba(139,92,246,0.3)]" style={{ borderImage: "linear-gradient(135deg, #14B8A6, #8B5CF6, #EC4899) 1" }} />
          
          {/* Outer Orbital Ring 2 (Dashed Icy Blue Shadow Ring) */}
          <div className="absolute w-48 h-16 border border-[#7DD3FC]/30 rounded-[100%] transform -rotate-[22deg] stroke-dashed border-dashed z-0" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. QUIET ICY CELESTIAL MOON WITH RADAR PATH (Bottom Left Viewport)        */}
      {/* ========================================================================= */}
      <div className="absolute bottom-[12%] left-[3%] w-36 h-36 opacity-50 hidden sm:block">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Planet Glow */}
          <div className="absolute w-24 h-24 rounded-full bg-[#7DD3FC]/10 blur-lg" />
          
          {/* Moon Body */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#38BDF8]/30 via-[#1E293B] to-[#0A0A0F] shadow-[inset_-5px_-5px_14px_rgba(0,0,0,0.9)] relative z-10 border border-[#7DD3FC]/15" />
          
          {/* Orbit Line */}
          <div className="absolute w-32 h-32 border border-[#7DD3FC]/20 rounded-full border-dashed animate-radar-sweep" style={{ animationDuration: "25s" }} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SLEEK SPACECRAFT SILHOUETTE WITH ICY EXHAUST TRAIL                     */}
      {/* ========================================================================= */}
      <div className="absolute top-[18%] left-[0%] w-full pointer-events-none animate-vector-drift opacity-40">
        <div className="flex items-center gap-3 transform -rotate-12">
          {/* Rocket Exhaust Trail Gradient */}
          <div className="w-48 h-[1.5px] bg-gradient-to-r from-transparent via-[#7DD3FC]/30 to-[#7DD3FC]" />
          
          {/* Rocket Vessel SVG */}
          <svg className="w-9 h-9 text-[#7DD3FC] drop-shadow-[0_0_10px_rgba(125,211,252,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="rgba(125, 211, 252, 0.1)" />
            <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" />
            <circle cx="12" cy="12" r="3" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Second Craft: Heavy Spaceship Vessel */}
      <div className="absolute top-[65%] left-[0%] w-full pointer-events-none animate-vector-drift opacity-30" style={{ animationDelay: "16s", animationDuration: "50s" }}>
        <div className="flex items-center gap-2 transform -rotate-[8deg]">
          <div className="w-64 h-[1.5px] bg-gradient-to-r from-transparent via-[#38BDF8]/20 to-[#38BDF8]" />
          <svg className="w-10 h-10 text-[#38BDF8] drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12 2L17 8L23 10L17 16L12 22L7 16L1 10L7 8L12 2Z" fill="rgba(56, 189, 248, 0.1)" />
            <line x1="1" y1="10" x2="23" y2="10" strokeDasharray="2 3" />
            <circle cx="12" cy="12" r="2.5" fill="#38BDF8" />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SATELLITE ARRAY WITH ORBITING RING                                      */}
      {/* ========================================================================= */}
      <div className="absolute top-[42%] right-[8%] opacity-40 hidden xl:block">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Central Satellite Dish/Panel */}
          <div className="w-10 h-10 rounded-xl bg-[#0D0E15] border border-[#7DD3FC]/20 flex items-center justify-center text-[#7DD3FC]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="9" y="9" width="6" height="6" rx="1" />
              <path d="M2 12H9 M15 12H22 M12 2V9 M12 15V22" />
              <rect x="3" y="9" width="3" height="6" />
              <rect x="18" y="9" width="3" height="6" />
            </svg>
          </div>

          {/* Elliptical Orbiting Track */}
          <div className="absolute inset-0 border border-[#7DD3FC]/20 rounded-full border-dashed animate-radar-sweep" style={{ animationDuration: "18s" }}>
            <div className="w-2.5 h-2.5 rounded-full bg-[#7DD3FC] shadow-[0_0_8px_#7DD3FC] absolute -top-1.25 left-1/2 -translate-x-1/2" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PCB CIRCUIT TRACES & HUD TARGET CROSSHAIR                               */}
      {/* ========================================================================= */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="icyTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* High Tech PCB Circuit Trace Line Left */}
        <path d="M 0 160 L 220 160 L 290 230 L 500 230" fill="none" stroke="url(#icyTraceGrad)" strokeWidth="1.2" strokeDasharray="6 4" />
        <circle cx="290" cy="230" r="3" fill="#7DD3FC" />
        <circle cx="500" cy="230" r="2.5" fill="#38BDF8" />

        {/* High Tech PCB Circuit Trace Line Right */}
        <path d="M 750 780 L 920 780 L 980 720 L 1400 720" fill="none" stroke="url(#icyTraceGrad)" strokeWidth="1.2" strokeDasharray="6 4" />
        <circle cx="980" cy="720" r="3" fill="#7DD3FC" />
      </svg>

      {/* Radar Target Scanner HUD */}
      <div className="absolute top-24 right-16 w-32 h-32 opacity-30 hidden lg:block">
        <div className="w-full h-full rounded-full border border-[#7DD3FC]/25 relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-[#7DD3FC]/20 border-dashed animate-radar-sweep" style={{ animationDuration: "16s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-[#7DD3FC]/25" />
            <div className="h-full w-[1px] bg-[#7DD3FC]/25 absolute" />
          </div>
          <span className="absolute top-1 left-2 text-[9px] font-mono text-[#7DD3FC]/80 tracking-widest font-bold">HUD.ORBIT // 01</span>
        </div>
      </div>

    </div>
  );
}

