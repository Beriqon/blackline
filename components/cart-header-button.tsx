"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart-context";
import { cn } from "@/lib/utils";

export function CartHeaderButton() {
  const { count, setOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center border border-gold/22 bg-charcoal/80 text-cream transition-colors hover:border-gold/40 hover:text-gold-secondary sm:h-11 sm:w-11",
      )}
      aria-label={count > 0 ? `Open selection cart, ${count} items` : "Open selection cart"}
    >
      <ShoppingBag className="size-[1.15rem] shrink-0 sm:size-5" aria-hidden />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-gold/35 bg-gold px-1 text-[0.6rem] font-bold tabular-nums text-[#0b0b0b]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
