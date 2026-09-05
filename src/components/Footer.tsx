import Link from "next/link";
import { Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#00E5FF]/20 bg-[#08080C] pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4 group inline-flex">
            <div className="p-1 rounded-md">
              <Code2 className="w-5 h-5 text-[#00E5FF] group-hover:text-[#FF2BD6] transition-colors" />
            </div>
            <span className="text-white">Dev<span className="text-[#00E5FF]">Roommate</span></span>
          </Link>
          <p className="text-gray-400 text-sm max-w-sm mb-6">
            The premium network for builders, hackers, and founders finding their technical partners.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4 text-sm">Platform</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/developers" className="hover:text-[#00E5FF] transition-colors">Find Developers</Link></li>
            <li><Link href="/post-request" className="hover:text-[#00E5FF] transition-colors">Post Requests</Link></li>
            <li><Link href="/hackathons" className="hover:text-[#00E5FF] transition-colors">Hackathons</Link></li>
            <li><Link href="/pricing" className="hover:text-[#00E5FF] transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 text-sm">Company</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-[#00E5FF] transition-colors">About Us</Link></li>
            <li><Link href="/blog" className="hover:text-[#00E5FF] transition-colors">Blog</Link></li>
            <li><Link href="/terms" className="hover:text-[#00E5FF] transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-[#00E5FF] transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs text-gray-400">
        <p>© 2026 Dev Roommate. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="https://twitter.com" target="_blank" className="hover:text-[#00E5FF] transition-colors">Twitter</Link>
          <Link href="https://github.com" target="_blank" className="hover:text-[#00E5FF] transition-colors">GitHub</Link>
          <Link href="https://discord.com" target="_blank" className="hover:text-[#00E5FF] transition-colors">Discord</Link>
        </div>
      </div>
    </footer>
  );
}
