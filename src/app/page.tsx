import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DeveloperFeed from "@/components/DeveloperFeed";
import FilterBar from "@/components/FilterBar";
import FeatureSection from "@/components/FeatureSection";
import TestimonialSection from "@/components/TestimonialSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      <Navbar />
      <HeroSection />
      
      <div className="bg-background-secondary/20 pt-20 pb-10 relative z-10">
        <Suspense fallback={<div className="h-20 max-w-6xl mx-auto mb-12 bg-background-secondary/80 animate-pulse rounded-2xl" />}>
          <FilterBar />
        </Suspense>
        <DeveloperFeed />
      </div>
      
      <FeatureSection />
      <TestimonialSection />
      <FinalCTA />
      
      <Footer />
    </main>
  );
}
