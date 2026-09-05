"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Welcome back!");
      router.push("/");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#08080C] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF2BD6]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md relative z-10 border-[#00E5FF]/30 shadow-2xl bg-[#11111A]/90 rounded-2xl"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="p-2 bg-[#00E5FF]/10 rounded-lg group-hover:bg-[#00E5FF]/20 transition-colors border border-[#00E5FF]/20">
            <Code2 className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <span className="text-white font-bold text-xl">Dev<span className="text-[#00E5FF]">Roommate</span></span>
        </Link>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome back</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Sign in to find your dev partner</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#08080C] border border-[#00E5FF]/20 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#08080C] border border-[#00E5FF]/20 text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account? <Link href="/signup" className="text-[#00E5FF] hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
