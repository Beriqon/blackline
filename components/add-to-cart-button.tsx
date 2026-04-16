"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart-context";
import type { CartLineInput } from "@/lib/cart-types";
import { cn } from "@/lib/utils";

const btnOutline =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-gold/30 bg-transparent px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0";

type Props = {
  item: CartLineInput;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  item,
  className,
  label = "Add to selection",
}: Props) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(item)}
      className={cn(btnOutline, className)}
    >
      <ShoppingBag className="size-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
