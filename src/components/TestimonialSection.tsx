"use client";

import { motion } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import { Quote } from "lucide-react";

export default function TestimonialSection() {
  return (
    <section id="testimonials" className="py-24 px-6 md:px-12 relative overflow-hidden bg-[#08080C]">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Success Stories</h2>
          <p className="text-gray-400 text-lg">Join hundreds of developers who found their perfect match.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="h-full bg-[#11111A]/80 border-none p-6 flex flex-col relative rounded-2xl backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(0,229,255,0.25)] transition-all"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[#00E5FF]/10" />
              <p className="text-white/90 leading-relaxed mb-8 flex-1 italic text-sm">
                "{test.content}"
              </p>
              
              <div className="flex items-center gap-3 mt-auto">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full border-none object-cover" />
                <div>
                  <h4 className="font-bold text-white text-sm">{test.name}</h4>
                  <p className="text-xs text-gray-400">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
