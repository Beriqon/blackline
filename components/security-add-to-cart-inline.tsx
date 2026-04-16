"use client";

import { AddToCartButton } from "@/components/add-to-cart-button";
import type { CartLineInput } from "@/lib/cart-types";

export function SecurityAddToCartInline({ item }: { item: CartLineInput }) {
  return (
    <div className="mt-8 border-t border-gold/10 pt-8">
      <AddToCartButton item={item} className="w-full sm:w-auto" />
    </div>
  );
}
