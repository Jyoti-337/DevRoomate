"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  formatter?: (val: number) => string;
}

export default function AnimatedCounter({
  from = 0,
  to,
  duration = 2.2,
  formatter = (val) => `${Math.floor(val).toLocaleString()}+`,
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-40px" });
  const [displayVal, setDisplayVal] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        setDisplayVal(value);
      },
    });

    return () => controls.stop();
  }, [isInView, from, to, duration]);

  return <span ref={nodeRef}>{formatter(displayVal)}</span>;
}
