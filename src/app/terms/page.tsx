import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing and using Dev Roommate, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site." },
    { id: "services", title: "2. Description of Services", content: "Dev Roommate provides a platform for developers to connect, collaborate, and form teams for projects, startups, and hackathons. We do not guarantee successful matchmaking or the outcome of any coordinated project." },
    { id: "accounts", title: "3. User Accounts", content: "You must be 13 years or older to use this Service. You are responsible for maintaining the security of your account and password. Dev Roommate cannot and will not be liable for any loss or damage from your failure to comply with this security obligation." },
    { id: "conduct", title: "4. User Conduct", content: "You agree to use the Service in a professional manner. Harassment, spamming, sending unsolicited commercial offers, or abusive language towards other developers will result in immediate account termination." },
    { id: "ip", title: "5. Intellectual Property", content: "We claim no intellectual property rights over the material you provide to the Service. Any code, designs, or ideas shared through our platform remain your property. However, by setting your profile to be viewed publicly, you agree to allow others to view your profile." },
    { id: "disclaimers", title: "6. Disclaimers", content: "The service is provided on an 'as is' and 'as available' basis. Dev Roommate makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of merchantability." },
    { id: "limitation", title: "7. Limitation of Liability", content: "In no event shall Dev Roommate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Dev Roommate." },
    { id: "contact", title: "8. Contact Information", content: "If you have any questions about these Terms, please contact us at legal@devroommate.com." },
  ];

  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Sticky Sidebar */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-32">
            <h3 className="font-bold mb-4 text-white uppercase tracking-wider text-sm">Table of Contents</h3>
            <ul className="space-y-3 border-l-2 border-[#00E5FF]/30 pl-4">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-sm text-gray-400 hover:text-[#00E5FF] transition-colors line-clamp-1">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Terms of Service</h1>
            <p className="text-gray-400">Last updated: <span className="text-[#00E5FF] font-medium">October 15, 2026</span></p>
          </div>

          <div className="space-y-12">
            {sections.map(s => (
              <section key={s.id} id={s.id} className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4 text-white">{s.title}</h2>
                <div className="text-gray-400 leading-relaxed">
                  {s.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
