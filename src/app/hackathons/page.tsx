import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Trophy, Calendar, Users, ChevronRight, PlusCircle } from "lucide-react";

export default function HackathonsPage() {
  const hackathons = [
    { name: "Global AI Weekender", date: "Oct 24-26, 2026", prize: "$50k Pool", tags: ["AI/ML", "NextJS", "OpenAI"], image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=300&fit=crop" },
    { name: "Web3 Defi Builders", date: "Nov 02-04, 2026", prize: "$100k Pool", tags: ["Solidity", "React", "Rust"], image: "https://images.unsplash.com/photo-1639762681485-074b7f4ec651?w=500&h=300&fit=crop" },
    { name: "Climate Tech Hack", date: "Nov 15-17, 2026", prize: "$25k Pool", tags: ["IoT", "Python", "Data Data"], image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=300&fit=crop" },
    { name: "SaaS Weekend Sprint", date: "Dec 05-07, 2026", prize: "$15k Pool", tags: ["SaaS", "Stripe", "Supabase"], image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=300&fit=crop" },
    { name: "GameJAM 2026", date: "Dec 12-14, 2026", prize: "$30k Pool", tags: ["Unity", "C#", "Blender"], image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&h=300&fit=crop" },
    { name: "Open Source Fest", date: "Jan 10-12, 2027", prize: "Community", tags: ["Good First Issue", "Typescript", "React"], image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=300&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[200px] bg-[#00E5FF]/20 blur-[100px] rounded-full -z-10 mix-blend-screen" />
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-white">Find your hackathon team in minutes</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Browse upcoming online hackathons and immediately match with developers looking for teammates.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/developers?projectType=hackathon" className="px-8 py-4 rounded-full bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.3)]">
              Browse Hackathon Builders <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {hackathons.map((h, i) => (
            <div key={i} className="glass-card flex flex-col overflow-hidden bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl group hover:-translate-y-1 transition-all duration-300 shadow-xl">
              <div className="h-40 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 z-20 bg-[#08080C]/90 backdrop-blur px-3 py-1 text-xs font-black rounded shadow-lg flex items-center gap-1.5 border border-[#00E5FF]/30 text-[#00E5FF]">
                  <Trophy className="w-3.5 h-3.5 text-[#FF2BD6]" /> {h.prize}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-3 text-white">{h.name}</h3>
                
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-[#00E5FF]" /> {h.date}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {h.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded text-[10px] uppercase font-mono font-bold text-[#00E5FF]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[#00E5FF]/20">
                  <Link href={`/developers?projectType=hackathon`} className="w-full py-2.5 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-black font-bold transition-all flex items-center justify-center gap-2 text-sm border border-[#00E5FF]/30">
                    <Users className="w-4 h-4" /> Find Team
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 md:p-12 text-center rounded-2xl flex flex-col items-center justify-center bg-[#11111A]/90 border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(0,229,255,0.15)] relative overflow-hidden">
          <div className="absolute -inset-24 bg-gradient-to-r from-[#00E5FF]/10 to-[#FF2BD6]/10 blur-2xl z-0" />
          <h2 className="text-3xl font-bold mb-4 relative z-10 text-white">Hosting a hackathon?</h2>
          <p className="text-gray-400 mb-8 max-w-lg relative z-10">List it here to help participants find teams and produce higher quality submissions.</p>
          <Link href="/post-request" className="relative z-10 px-8 py-3 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20">
            <PlusCircle className="w-5 h-5" /> Host a Hackathon
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
