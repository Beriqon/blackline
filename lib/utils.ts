import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffleImmutable<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = next[i]!;
    next[i] = next[j]!;
    next[j] = t;
  }
  return next;
}
