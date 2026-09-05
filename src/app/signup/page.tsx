"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Full Name must be at least 2 characters long.";
    }
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters long.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = Object.values(errors)[0] || "Please fix the highlighted fields in the form";
      toast.error(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          techStack: ["React"],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! You can now log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#08080C] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF2BD6]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md relative z-10 border-[#00E5FF]/30 shadow-2xl bg-[#11111A]/90 rounded-2xl"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="p-2 bg-[#00E5FF]/10 rounded-lg border border-[#00E5FF]/20">
            <Code2 className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <span className="text-white font-bold text-xl">Dev<span className="text-[#00E5FF]">Roommate</span></span>
        </Link>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Create an account</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Join thousands of builders</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
            <input 
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg bg-[#08080C] border ${errors.name ? 'border-red-500' : 'border-[#00E5FF]/20'} text-white focus:outline-none focus:border-[#00E5FF]`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
            <input 
              name="username"
              type="text" 
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg bg-[#08080C] border ${errors.username ? 'border-red-500' : 'border-[#00E5FF]/20'} text-white focus:outline-none focus:border-[#00E5FF]`}
              placeholder="johndoe123"
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg bg-[#08080C] border ${errors.email ? 'border-red-500' : 'border-[#00E5FF]/20'} text-white focus:outline-none focus:border-[#00E5FF]`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg bg-[#08080C] border ${errors.password ? 'border-red-500' : 'border-[#00E5FF]/20'} text-white focus:outline-none focus:border-[#00E5FF]`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-[#00E5FF] via-[#8C64FF] to-[#FF2BD6] text-black font-black hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? "Creating..." : "Sign Up"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link href="/login" className="text-[#00E5FF] hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
