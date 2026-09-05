import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Globe, Heart, Zap } from "lucide-react";

export default function AboutPage() {
  const founders = [
    { name: "Alex Chen", role: "CEO & Co-founder", avatar: "https://i.pravatar.cc/150?img=11", github: "https://github.com" },
    { name: "Sarah Jenkins", role: "CTO", avatar: "https://i.pravatar.cc/150?img=12", github: "https://github.com" },
    { name: "David Kim", role: "Head of Product", avatar: "https://i.pravatar.cc/150?img=13", github: "https://github.com" },
    { name: "Emily Parker", role: "Lead Engineer", avatar: "https://i.pravatar.cc/150?img=14", github: "https://github.com" },
  ];

  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans selection:bg-[#00E5FF]/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            We're building the dev collaboration layer of the internet
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our mission is to connect ambitious builders so nobody has to build alone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <div>
            <h2 className="text-3xl font-bold mb-6">Built by builders, for builders.</h2>
            <p className="text-gray-400 text-lg mb-4">
              We started Dev Roommate after struggling to find reliable technical partners for weekend hackathons and side projects. 
              The existing networks were too noisy, too enterprise-focused, or simply inactive.
            </p>
            <p className="text-gray-400 text-lg">
              We built this platform to be the definitive place where verified, passionate developers can find each other based on stack, timezone, and raw ambition.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#00E5FF]/20 blur-[100px] rounded-full" />
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" alt="Team collaborating" className="rounded-2xl border border-[#00E5FF]/30 relative z-10 shadow-2xl" />
          </div>
        </div>

        <div className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {founders.map(f => (
              <div key={f.name} className="glass-card p-6 text-center group border border-[#00E5FF]/20 hover:border-[#00E5FF]/50 rounded-2xl bg-[#11111A]/80">
                <img src={f.avatar} alt={f.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-[#00E5FF]/40 group-hover:border-[#00E5FF] transition-colors object-cover" />
                <h3 className="font-bold text-lg">{f.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{f.role}</p>
                <Link href={f.github} target="_blank" className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                  <span className="w-5 h-5">🐙</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 border-t-4 border-t-[#00E5FF] bg-[#11111A]/80 rounded-2xl border border-[#00E5FF]/20">
              <Globe className="w-8 h-8 text-[#00E5FF] mb-4" />
              <h3 className="text-xl font-bold mb-3">Remote First</h3>
              <p className="text-gray-400">Talent is evenly distributed, opportunity is not. We believe the best teams can be built across oceans and timezones.</p>
            </div>
            <div className="glass-card p-8 border-t-4 border-t-[#FF2BD6] bg-[#11111A]/80 rounded-2xl border border-[#00E5FF]/20">
              <Heart className="w-8 h-8 text-[#FF2BD6] mb-4" />
              <h3 className="text-xl font-bold mb-3">Open Source</h3>
              <p className="text-gray-400">We actively support and contribute to the open-source community that builds the foundations we all rely on.</p>
            </div>
            <div className="glass-card p-8 border-t-4 border-t-white bg-[#11111A]/80 rounded-2xl border border-[#00E5FF]/20">
              <Zap className="w-8 h-8 text-white mb-4" />
              <h3 className="text-xl font-bold mb-3">Builder Mindset</h3>
              <p className="text-gray-400">We ship fast, iterate, and learn from our users. Perfection is the enemy of done when prototyping.</p>
            </div>
          </div>
        </div>

        <div className="text-center glass-card p-12 relative overflow-hidden bg-[#11111A]/80 rounded-3xl border border-[#00E5FF]/30">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/10 to-[#FF2BD6]/10" />
          <h2 className="text-3xl font-bold mb-6 relative z-10">Ready to start building?</h2>
          <Link href="/signup" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            Join Dev Roommate Today
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
