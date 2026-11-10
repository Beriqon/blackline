"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-context";

export function CartAfterPayment({ paidKeys }: { paidKeys: string[] }) {
  const { items, clear, removeItem } = useCart();
  const fingerprint = JSON.stringify(paidKeys);
  useEffect(() => {
    const keys = new Set<string>(JSON.parse(fingerprint));
    const matching = items.filter(item => keys.has(item.key));
    if (!matching.length) return;
    // Preserve selections added after payment was started, including other dates
    // for the same product. Clear add-ons only when this whole cart was checked out.
    if (matching.length === items.length) clear();
    else matching.forEach(item => removeItem(item.key));
  }, [fingerprint, items, clear, removeItem]);
  return null;
}
