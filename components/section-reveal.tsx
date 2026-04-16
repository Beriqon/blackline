"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

export function SectionReveal({
  children,
  className,
  delay = 0,
  id,
  "aria-labelledby": ariaLabelledby,
  "aria-label": ariaLabel,
}: SectionRevealProps) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 36 };

  return (
    <motion.section
      id={id}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      /* Loose threshold so sections don’t stay at opacity 0 if IO never reaches 12% visible */
      viewport={{ once: true, margin: "0px", amount: 0.01 }}
      transition={{
        duration: 0.85,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.section>
  );
}
