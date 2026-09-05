"use client";

import { Code2, Cpu, Database, Flame, Globe, Layers, ShieldCheck, Zap } from "lucide-react";

const TECH_STACK_ITEMS = [
  { name: "Next.js 15 App Router", icon: Globe, color: "text-[#00E5FF]" },
  { name: "PyTorch & FastAPI AI", icon: Cpu, color: "text-[#FF2BD6]" },
  { name: "Solidity Smart Contracts", icon: ShieldCheck, color: "text-[#00E5FF]" },
  { name: "Rust & WASM Engine", icon: Flame, color: "text-[#8C64FF]" },
  { name: "PostgreSQL & Prisma", icon: Database, color: "text-[#FF2BD6]" },
  { name: "TypeScript 5.7", icon: Code2, color: "text-[#00E5FF]" },
  { name: "Tailwind CSS v4", icon: Layers, color: "text-[#8C64FF]" },
  { name: "GraphQL & Redis", icon: Zap, color: "text-[#00E5FF]" },
];

export default function LiveMarquee() {
  // Duplicate list to create seamless infinite loop
  const marqueeItems = [...TECH_STACK_ITEMS, ...TECH_STACK_ITEMS];

  return (
    <div className="w-full bg-[#11111A]/90 border-none shadow-[0_4px_25px_rgba(0,0,0,0.5)] py-4 overflow-hidden relative backdrop-blur-md z-20">
      {/* Edge Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#08080C] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#08080C] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-8">
        {marqueeItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/8 border-none text-xs font-semibold text-gray-300 flex-shrink-0 hover:bg-white/15 hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] transition-all"
            >
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
