"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { features } from "@/data/features";
import Image from "next/image";

function FeatureVisual({ src, alt, isEven }: { src: string; alt: string; isEven: boolean }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // The premium fallback glass-card structure
  const fallback = (
     <div className="relative z-10 w-3/4 h-3/4 bg-[#08080C]/60 rounded-2xl border-none backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden p-6">
       <div className="w-full h-full space-y-4">
           <div className="h-6 w-1/3 bg-white/5 rounded mx-auto animate-pulse" />
           <div className="space-y-2 mt-8">
             <div className="h-10 w-full bg-white/5 rounded-lg border-none animate-pulse" />
             <div className="h-10 w-full bg-white/5 rounded-lg border-none animate-pulse" />
             <div className="h-10 w-4/5 bg-white/5 rounded-lg border-none animate-pulse" />
           </div>
       </div>
       <div className={`absolute right-10 bottom-10 w-16 h-16 rounded-full blur-xl ${isEven ? 'bg-[#00E5FF]/80' : 'bg-[#FF2BD6]/80'} animate-pulse`} />
     </div>
  );

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass-card group flex items-center justify-center border-none shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
       {/* Background gradient overlay */}
       <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${isEven ? 'from-[#00E5FF] to-transparent' : 'from-[#FF2BD6] to-transparent'} group-hover:scale-110 transition-transform duration-700`} />
       
       {!error ? (
         <div className={`relative w-[90%] h-[90%] flex items-center justify-center transition-all duration-500 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
           <Image
             src={src}
             alt={alt}
             fill
             sizes="(max-w-768px) 100vw, 50vw"
             className="object-contain p-4 rounded-2xl drop-shadow-[0_0_40px_rgba(0,229,255,0.2)] group-hover:scale-105 transition-transform duration-500"
             onLoad={() => setLoaded(true)}
             onError={() => setError(true)}
           />
         </div>
       ) : null}

       {(!loaded || error) && fallback}
    </div>
  );
}

export default function FeatureSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#08080C]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Built for Serious Builders</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to find the perfect technical co-founder, hackathon partner, or open-source contributor.
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <div key={feature.id} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}>
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  className="flex-1 space-y-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#FF2BD6]/20 border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                    <Icon className="w-7 h-7 text-[#00E5FF]" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">{feature.title}</h3>
                  <p className="text-lg text-gray-400 leading-relaxed w-full max-w-lg">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" /> Feature specific point 1
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF2BD6]" /> Analytics and matchmaking
                    </li>
                  </ul>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="flex-1 w-full"
                >
                  <FeatureVisual src={feature.image} alt={feature.title} isEven={isEven} />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
