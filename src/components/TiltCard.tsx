"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { motion, useSpring } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export default function TiltCard({ children, className = "", maxTilt = 10, onClick }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isDisabled, setIsDisabled] = useState(true);

  const rotateX = useSpring(0, { stiffness: 300, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIsDisabled(!finePointer || reducedMotion);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative cursor position in percentages
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentX = (mouseX / width) * 100;
    const percentY = (mouseY / height) * 100;

    setSpotlightPos({ x: percentX, y: percentY, opacity: 1 });

    // Calculate normalized 3D tilt angles (-1 to +1)
    const normX = (mouseX / width - 0.5) * 2;
    const normY = (mouseY / height - 0.5) * 2;

    rotateX.set(-normY * maxTilt);
    rotateY.set(normX * maxTilt);
  };

  const handleMouseLeave = () => {
    if (isDisabled) return;
    setSpotlightPos((prev) => ({ ...prev, opacity: 0 }));
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      style={
        isDisabled
          ? {}
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              perspective: 1000,
            }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic Cursor Radial Emerald Spotlight Glow */}
      {!isDisabled && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
          style={{
            opacity: spotlightPos.opacity,
            background: `radial-gradient(400px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(16, 185, 129, 0.18), transparent 80%)`,
          }}
        />
      )}

      {children}
    </motion.div>
  );
}
