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
import { getProduct, promoDiscount } from "./products";

export interface CartLine {
  id: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  savings: number;
  discount: number;
  promo: string;
  promoError: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  openCart: () => void;
  add: (id: string, qty?: number, opts?: { openDrawer?: boolean }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "fresava-cart-v1";

function load(): { lines: CartLine[]; promo: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], promo: "" };
    const parsed = JSON.parse(raw) as { lines: CartLine[]; promo: string };
    const lines = (parsed.lines ?? []).filter((l) => {
      try {
        getProduct(l.id);
        return l.qty > 0 && l.qty <= 99;
      } catch {
        return false;
      }
    });
    return { lines, promo: parsed.promo ?? "" };
  } catch {
    return { lines: [], promo: "" };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [promo, setPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount — server and first
    // client render must match, so this can't be a lazy useState initializer.
    const { lines: l, promo: p } = load();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(l);
    setPromo(p);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, promo }));
    } catch {
      // ignore quota/blocked storage
    }
  }, [lines, promo, hydrated]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const openCart = useCallback(() => setOpen(true), []);

  const add = useCallback(
    (id: string, qty = 1, opts?: { openDrawer?: boolean }) => {
      getProduct(id); // validates
      setLines((prev) => {
        const found = prev.find((l) => l.id === id);
        if (found) {
          return prev.map((l) =>
            l.id === id ? { ...l, qty: Math.min(99, l.qty + qty) } : l
          );
        }
        return [...prev, { id, qty }];
      });
      if (opts?.openDrawer !== false) {
        window.setTimeout(() => setOpen(true), 120);
      }
    },
    []
  );

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        remove(id);
        return;
      }
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, qty: Math.min(99, qty) } : l))
      );
    },
    [remove]
  );

  const clear = useCallback(() => {
    setLines([]);
    setPromo("");
    setPromoError("");
  }, []);

  const applyPromo = useCallback(
    (code: string) => {
      const clean = code.trim().toUpperCase();
      if (!clean) {
        setPromoError("Enter a code first.");
        return false;
      }
      const sub = lines.reduce((s, l) => s + getProduct(l.id).price * l.qty, 0);
      if (promoDiscount(sub, clean) > 0) {
        setPromo(clean);
        setPromoError("");
        return true;
      }
      setPromoError("That code doesn't look right. Try FRESAVA10.");
      return false;
    },
    [lines]
  );

  const clearPromo = useCallback(() => {
    setPromo("");
    setPromoError("");
  }, []);

  const { count, subtotal, savings } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    let savings = 0;
    lines.forEach((l) => {
      const p = getProduct(l.id);
      count += l.qty * p.jars;
      subtotal += p.price * l.qty;
      if (p.compareAt) savings += (p.compareAt - p.price) * l.qty;
    });
    return { count, subtotal, savings };
  }, [lines]);

  const discount = useMemo(
    () => (promo ? promoDiscount(subtotal, promo) : 0),
    [promo, subtotal]
  );

  const value: CartContextValue = {
    lines,
    count,
    subtotal,
    savings,
    discount,
    promo,
    promoError,
    isOpen,
    setOpen,
    openCart,
    add,
    remove,
    setQty,
    clear,
    applyPromo,
    clearPromo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
