"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product } from "./products";
import { api } from "./api/client";
import type { Product as CatalogProduct, Quote } from "@shared/contracts";
export interface CartLine {
  id: string;
  qty: number;
}
interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  savings: number;
  discount: number;
  promo: string;
  promoError: string;
  isOpen: boolean;
  hydrated: boolean;
  products: Product[];
  freeThreshold: number;
  setOpen: (open: boolean) => void;
  openCart: () => void;
  add: (id: string, qty?: number, opts?: { openDrawer?: boolean }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  applyPromo: (code: string) => Promise<boolean>;
  clearPromo: () => void;
}
const Context = createContext<CartValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]),
    [promo, setPromo] = useState(""),
    [promoError, setPromoError] = useState(""),
    [discount, setDiscount] = useState(0),
    [isOpen, setOpen] = useState(false),
    [hydrated, setHydrated] = useState(false),
    [products, setProducts] = useState(PRODUCTS),
    [freeThreshold, setFreeThreshold] = useState(1500);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("fresava-cart-v1") ?? "{}");
      if (Array.isArray(saved.lines))
        // Browser-only persisted state is loaded after the matching SSR render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLines(
          saved.lines.filter(
            (l: CartLine) =>
              typeof l.id === "string" &&
              Number.isInteger(l.qty) &&
              l.qty > 0 &&
              l.qty <= 99,
          ),
        );
      if (typeof saved.promo === "string") setPromo(saved.promo);
    } catch {}
    setHydrated(true);
    api<{
      products: CatalogProduct[];
      zones: { code: string; free_threshold: number }[];
    }>("catalog")
      .then((c) => {
        setProducts(
          c.products.map((p) => ({
            id: p.sku,
            name: p.name,
            jars: p.jars,
            size: `${p.jars} × ${p.jar_weight_g} g`,
            price: p.price / 100,
            compareAt: p.compare_at ? p.compare_at / 100 : undefined,
            prices: p.prices.map((pr) => ({
              currency: pr.currency,
              price: pr.price / 100,
              compareAt: pr.compare_at ? pr.compare_at / 100 : undefined,
            })),
            badge: p.badge ?? undefined,
            blurb: p.blurb,
          })),
        );
        setFreeThreshold(
          (c.zones.find((z) => z.code === "dhaka")?.free_threshold ?? 150000) /
            100,
        );
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(
          "fresava-cart-v1",
          JSON.stringify({ lines, promo }),
        );
      } catch {}
  }, [lines, promo, hydrated]);
  useEffect(() => {
    if (!isOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [isOpen]);
  useEffect(() => {
    let active = true;
    if (!lines.length || !promo) {
      return;
    }
    api<Quote>("checkout/quote", {
      method: "POST",
      body: {
        lines: lines.map((l) => ({ sku: l.id, quantity: l.qty })),
        zone: "dhaka",
        promo,
      },
    })
      .then((q) => {
        if (active) {
          setDiscount(q.discount / 100);
          setPromoError("");
        }
      })
      .catch((e) => {
        if (active) {
          setDiscount(0);
          setPromoError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [lines, promo]);
  const add = (id: string, qty = 1, opts?: { openDrawer?: boolean }) => {
    if (!products.some((p) => p.id === id) || !Number.isInteger(qty) || qty < 1)
      return;
    setLines((old) =>
      old.some((l) => l.id === id)
        ? old.map((l) =>
            l.id === id ? { id, qty: Math.min(99, l.qty + qty) } : l,
          )
        : [...old, { id, qty: Math.min(99, qty) }],
    );
    if (opts?.openDrawer !== false) setOpen(true);
  };
  const remove = (id: string) =>
    setLines((old) => old.filter((l) => l.id !== id));
  const setQty = (id: string, qty: number) => {
    if (!Number.isInteger(qty)) return;
    if (qty <= 0) remove(id);
    else
      setLines((old) =>
        old.map((l) => (l.id === id ? { id, qty: Math.min(99, qty) } : l)),
      );
  };
  let subtotal = 0,
    count = 0,
    savings = 0;
  for (const l of lines) {
    const p = products.find((p) => p.id === l.id);
    if (p) {
      subtotal += p.price * l.qty;
      count += p.jars * l.qty;
      savings += Math.max(0, (p.compareAt ?? p.price) - p.price) * l.qty;
    }
  }
  const clear = () => {
    setLines([]);
    setPromo("");
    setDiscount(0);
    setPromoError("");
  };
  const applyPromo = async (code: string) => {
    try {
      const q = await api<Quote>("checkout/quote", {
        method: "POST",
        body: {
          lines: lines.map((l) => ({ sku: l.id, quantity: l.qty })),
          zone: "dhaka",
          promo: code.trim(),
        },
      });
      setPromo(code.trim().toUpperCase());
      setDiscount(q.discount / 100);
      setPromoError("");
      return true;
    } catch (e) {
      setPromoError((e as Error).message);
      return false;
    }
  };
  return (
    <Context.Provider
      value={{
        lines,
        count,
        subtotal,
        savings,
        discount: lines.length && promo ? discount : 0,
        promo,
        promoError,
        isOpen,
        hydrated,
        products,
        freeThreshold,
        setOpen,
        openCart: () => setOpen(true),
        add,
        remove,
        setQty,
        clear,
        applyPromo,
        clearPromo: () => {
          setPromo("");
          setPromoError("");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error("CartProvider missing");
  return value;
}
