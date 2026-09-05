import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AerospaceMotifs from "@/components/AerospaceMotifs";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Dev Roommate | Find Your Perfect Project Partner",
  description: "Connect with developers and build faster together. Used by indie hackers, students, startup builders, and hackathon teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-[#050505] text-[#F8FAFC] selection:bg-[#8B5CF6] selection:text-white`}
      >
        <Providers>
          <AerospaceMotifs />
          {children}
        </Providers>
      </body>
    </html>
  );
}

