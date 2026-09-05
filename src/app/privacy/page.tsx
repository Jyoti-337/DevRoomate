import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const sections = [
    { id: "data", title: "1. Data We Collect", content: "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, avatar, GitHub profile, and resume." },
    { id: "usage", title: "2. How We Use It", content: "We use the information we collect to provide, maintain, and improve our services, to process transactions, send you related information, and match you with other developers on the platform based on your preferences and skills." },
    { id: "sharing", title: "3. Information Sharing", content: "We do not sell your personal information. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf, in an aggregated or anonymized form." },
    { id: "cookies", title: "4. Cookies & Tracking", content: "We use cookies and similar technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies, but some parts of our Service may not function properly without them." },
    { id: "retention", title: "5. Data Retention", content: "We retain personal data only for as long as necessary to provide the Services and fulfill the transactions you have requested, or for other essential purposes such as complying with our legal obligations." },
    { id: "rights", title: "6. Your Data Rights (GDPR)", content: "If you are a resident of the EEA, you have the right to access, update, or delete the information we have on you. You have the right of rectification, the right to object, the right of restriction, and the right to data portability." },
    { id: "contact", title: "7. Contact Us", content: "If you have any questions or concerns about this privacy policy, please contact our Data Protection Officer at privacy@devroommate.com." },
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
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Privacy Policy</h1>
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
