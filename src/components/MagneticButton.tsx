"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { motion, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number; // Distance pull multiplier
}

const isFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function MagneticButton({ children, className = "", strength = 0.35 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useSpring(0, { stiffness: 180, damping: 14 });
  const y = useSpring(0, { stiffness: 180, damping: 14 });


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFinePointer() || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };


  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
