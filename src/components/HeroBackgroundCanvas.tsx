"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export default function HeroBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse inertia tracking
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 200,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Initialize Calm Icy Blue telemetry particles
    const particleCount = Math.min(Math.floor((width * height) / 20000), 45);
    const colors = [
      "rgba(125, 211, 252, ",  // Calm Icy Blue
      "rgba(224, 242, 254, ",  // Pure Icy White
      "rgba(56, 189, 248, ",   // Sky Accent
    ];
    
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.8 + 0.6,
        color: colorBase,
        alpha: Math.random() * 0.35 + 0.15,
      };
    });

    // Static render for reduced motion
    if (prefersReducedMotion) {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle static icy blue blob
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 0, width * 0.2, height * 0.3, width * 0.4);
      grad1.addColorStop(0, "rgba(125, 211, 252, 0.05)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
      };
    }

    // Main animation loop
    let lastTime = performance.now();
    
    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth mouse interpolation (spring inertia)
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Quiet Ambient Icy & Subtle Aurora Gradient Blobs
      const blob1X = width * 0.3 + Math.sin(time * 0.0003) * 100 + (mouse.x - width / 2) * 0.05;
      const blob1Y = height * 0.35 + Math.cos(time * 0.0002) * 60 + (mouse.y - height / 2) * 0.05;
      const grad1 = ctx.createRadialGradient(blob1X, blob1Y, 0, blob1X, blob1Y, Math.max(width, height) * 0.4);
      grad1.addColorStop(0, "rgba(125, 211, 252, 0.07)");
      grad1.addColorStop(0.5, "rgba(139, 92, 246, 0.02)");
      grad1.addColorStop(1, "transparent");

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const blob2X = width * 0.75 + Math.cos(time * 0.0004) * 80 - (mouse.x - width / 2) * 0.04;
      const blob2Y = height * 0.6 + Math.sin(time * 0.0003) * 70 - (mouse.y - height / 2) * 0.04;
      const grad2 = ctx.createRadialGradient(blob2X, blob2Y, 0, blob2X, blob2Y, Math.max(width, height) * 0.35);
      grad2.addColorStop(0, "rgba(20, 184, 166, 0.05)");
      grad2.addColorStop(0.6, "rgba(125, 211, 252, 0.02)");
      grad2.addColorStop(1, "transparent");

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Cursor Highlight Spot Glow (Icy Blue)
      const cursorGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
      cursorGrad.addColorStop(0, "rgba(125, 211, 252, 0.05)");
      cursorGrad.addColorStop(1, "transparent");
      ctx.fillStyle = cursorGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Particles and Constellation Lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse repulsion / influence
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 0.6;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pDist < 110) {
            const lineAlpha = (1 - pDist / 110) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(125, 211, 252, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

