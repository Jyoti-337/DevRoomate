"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, HelpCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const faqs = [
    { q: "Can I cancel my Pro subscription at any time?", a: "Yes, you can cancel your subscription at any time from your billing settings. Your access will remain active until the end of your billing period." },
    { q: "What's the difference between Free and Pro?", a: "Free users can send up to 5 pings per day. Pro users get unlimited pings, priority visibility in the developer feed, and access to premium hackathon listings." },
    { q: "Do you offer discounts for students?", a: "Yes! If you sign up with a valid .edu email address, you automatically receive a 50% discount on the Pro plan." },
    { q: "How do teams work?", a: "The Team plan allows you to add up to 5 collaborators under one billing account, perfect for startup incubators or established hackathon squads." },
    { q: "Is Dev Roommate completely remote?", a: "Absolutely. Our platform is built specifically to connect remote developers across the globe." },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-6 text-white">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Level up your networking and find the perfect team. Always free for basic use.
          </p>
          
          <div className="inline-flex items-center gap-3 p-1.5 bg-[#11111A]/90 border border-[#00E5FF]/20 rounded-full">
            <button onClick={() => setAnnual(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${!annual ? 'bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${annual ? 'bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
              Annually <span className="text-[10px] bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-0.5 rounded-full ml-1 uppercase border border-[#00E5FF]/30">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32 max-w-5xl mx-auto">
          {/* Free */}
          <div className="glass-card p-8 flex flex-col relative bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl">
            <h3 className="text-xl font-bold mb-2 text-white">Hacker</h3>
            <p className="text-gray-400 text-sm mb-6 h-10">Perfect for students and weekend builders.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold font-mono text-white">$0</span>
            </div>
            <Link href="/signup" className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-colors text-center mb-8">
              Get Started Free
            </Link>
            <ul className="space-y-4 text-sm text-gray-400 flex-1">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Public profile</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> 5 pings per day</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Browse feed</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Join open requests</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 flex flex-col relative bg-[#11111A]/90 border-2 border-[#00E5FF] rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.2)] transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black px-4 py-1 rounded-full text-xs font-black tracking-wider shadow-md">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Pro Builder</h3>
            <p className="text-gray-400 text-sm mb-6 h-10">For indie hackers and serious founders.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold font-mono text-white">${annual ? '7' : '9'}</span><span className="text-gray-400">/mo</span>
            </div>
            <Link href="/signup?plan=pro" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#FF2BD6] text-black font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,229,255,0.3)] text-center mb-8">
              Start Pro Trial
            </Link>
            <ul className="space-y-4 text-sm text-white flex-1">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Everything in Hacker</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Unlimited daily pings</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Priority feed visibility</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Premium hackathon access</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Read receipts on messages</li>
            </ul>
          </div>

          {/* Team */}
          <div className="glass-card p-8 flex flex-col relative bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl">
            <h3 className="text-xl font-bold mb-2 text-white">Startup Squad</h3>
            <p className="text-gray-400 text-sm mb-6 h-10">For accelerators and established dev shops.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold font-mono text-white">${annual ? '24' : '29'}</span><span className="text-gray-400">/mo</span>
            </div>
            <Link href="mailto:sales@devroommate.com" className="w-full py-3 rounded-xl border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors text-center mb-8">
              Contact Us
            </Link>
            <ul className="space-y-4 text-sm text-gray-400 flex-1">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> 5 Pro accounts included</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Shared team inbox</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Dedicated account manager</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-[#00E5FF] shrink-0" /> Custom integrations API</li>
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card overflow-hidden bg-[#11111A]/80 border border-[#00E5FF]/20 rounded-2xl transition-colors hover:border-[#00E5FF]/40">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none cursor-pointer"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <HelpCircle className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'text-[#00E5FF] rotate-180' : 'text-gray-400'}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 pt-0 text-gray-400 text-sm">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
