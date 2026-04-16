"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { CartDrawer } from "@/components/cart-drawer";
import { bookingSelectionKey } from "@/lib/bookings";
import type {
  CartAddonsState,
  CartLine,
  CartLineInput,
} from "@/lib/cart-types";
import {
  cartLineKey,
  DEFAULT_CART_ADDONS,
  isSingleUnitInventory,
} from "@/lib/cart-types";

const STORAGE_KEY_V2 = "blackline-cart-v3";
const STORAGE_KEY_V1 = "blackline-cart-v1";

function stripLegacyVilla(lines: CartLine[]): CartLine[] {
  return lines.filter(
    (line) => (line as { category?: string }).category !== "villa",
  ) as CartLine[];
}

type CartContextValue = {
  items: CartLine[];
  addons: CartAddonsState;
  setAddons: (next: CartAddonsState | ((prev: CartAddonsState) => CartAddonsState)) => void;
  patchAddons: (patch: Partial<CartAddonsState>) => void;
  count: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (input: CartLineInput) => void;
  removeItem: (key: string) => void;
  decrementItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [addons, setAddons] = useState<CartAddonsState>(DEFAULT_CART_ADDONS);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  const patchAddons = useCallback((patch: Partial<CartAddonsState>) => {
    setAddons((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    let nextItems: CartLine[] | null = null;
    let nextAddons: CartAddonsState | null = null;
    try {
      const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
      if (rawV2) {
        const parsed = JSON.parse(rawV2) as {
          items?: CartLine[];
          addons?: Partial<CartAddonsState>;
        };
        if (parsed.items && Array.isArray(parsed.items)) {
          nextItems = stripLegacyVilla(parsed.items).map((line) => ({
            ...line,
            quantity: 1,
          }));
          if (parsed.addons && typeof parsed.addons === "object") {
            nextAddons = {
              ...DEFAULT_CART_ADDONS,
              ...parsed.addons,
              femaleHostsCount: Math.min(
                8,
                Math.max(
                  1,
                  Math.floor(
                    Number(parsed.addons.femaleHostsCount) ||
                      DEFAULT_CART_ADDONS.femaleHostsCount,
                  ),
                ),
              ),
            };
          }
        }
      }

      if (!nextItems) {
        const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
        if (rawV1) {
        const parsed = JSON.parse(rawV1) as CartLine[];
        if (Array.isArray(parsed)) {
          nextItems = stripLegacyVilla(parsed).map((line) => ({
            ...line,
            quantity: 1,
          }));
        }
        }
      }
    } catch {
      /* ignore */
    }
    queueMicrotask(() => {
      if (nextItems) setItems(nextItems);
      if (nextAddons) setAddons(nextAddons);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload = JSON.stringify({ items, addons });
      localStorage.setItem(STORAGE_KEY_V2, payload);
    } catch {
      /* ignore */
    }
  }, [items, addons, hydrated]);

  const addItem = useCallback((input: CartLineInput) => {
    const key = cartLineKey(
      input.category,
      input.id,
      bookingSelectionKey(input.bookingSelection),
    );
    const single = isSingleUnitInventory(input.category);
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx === -1) {
        return [
          ...prev,
          {
            ...input,
            key,
            quantity: 1,
            addedAt: Date.now(),
          },
        ];
      }
      if (single) {
        return prev;
      }
      const next = [...prev];
      const cur = next[idx]!;
      next[idx] = { ...cur, quantity: cur.quantity + 1 };
      return next;
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const decrementItem = useCallback((key: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx === -1) return prev;
      const cur = prev[idx]!;
      if (cur.quantity <= 1) {
        return prev.filter((x) => x.key !== key);
      }
      const next = [...prev];
      next[idx] = { ...cur, quantity: cur.quantity - 1 };
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setAddons(DEFAULT_CART_ADDONS);
  }, []);

  const count = useMemo(
    () => items.reduce((sum, x) => sum + x.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addons,
      setAddons,
      patchAddons,
      count,
      open,
      setOpen,
      addItem,
      removeItem,
      decrementItem,
      clear,
    }),
    [
      items,
      addons,
      patchAddons,
      count,
      open,
      addItem,
      removeItem,
      decrementItem,
      clear,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
