"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tileTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as const,
};

/**
 * Staggered scroll-in for catalog cards and gallery tiles — matches
 * `/experiences` photo grid behavior (fade + slight rise + optional scale).
 */
export function ScrollRevealItem({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const hidden = reduceMotion
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 0, y: 28, scale: 0.98 };

  return (
    <motion.div
      className={cn(className)}
      initial={hidden}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
      transition={{
        ...tileTransition,
        delay: reduceMotion ? 0 : index * 0.06,
      }}
    >
      {children}
    </motion.div>
  );
}
