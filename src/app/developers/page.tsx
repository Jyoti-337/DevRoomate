import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeveloperFeed from "@/components/DeveloperFeed";
import FilterBar from "@/components/FilterBar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans scroll-smooth">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="px-6 md:px-12 max-w-7xl mx-auto w-full mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-[#00E5FF]" />
            <span className="text-[#00E5FF] font-bold">Find Developers</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
             <h1 className="text-4xl font-bold tracking-tight text-white">Find Developers</h1>
             <div className="px-3 py-1.5 rounded-full border border-[#00E5FF]/30 text-[#00E5FF] bg-[#00E5FF]/10 text-xs font-black inline-flex w-max shadow-[0_0_10px_rgba(0,229,255,0.2)]">
               247 developers available
             </div>
          </div>
        </div>

        <div className="sticky top-[73px] z-30 bg-[#08080C]/90 backdrop-blur-md pt-4 pb-4 border-b border-[#00E5FF]/20 mb-8 px-6 md:px-12">
           <Suspense fallback={<div className="h-12 w-full animate-pulse bg-white/5 rounded-xl" />}>
             <FilterBar />
           </Suspense>
        </div>

        <DeveloperFeed />
      </main>

      <Footer />
    </div>
  );
}
