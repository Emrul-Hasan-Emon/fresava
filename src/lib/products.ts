export interface Product {
  id: string;
  name: string;
  jars: number;
  size: string;
  price: number;
  compareAt?: number;
  badge?: string;
  blurb: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "single",
    name: "Signature Jar",
    jars: 1,
    size: "1 × 240 g",
    price: 495,
    blurb: "One jar of Dragon Fruit Spread. Start here.",
  },
  {
    id: "duo",
    name: "The Pair",
    jars: 2,
    size: "2 × 240 g",
    price: 940,
    compareAt: 990,
    badge: "Most loved",
    blurb: "One for toast, one for yoghurt. Or one for a friend.",
  },
  {
    id: "family",
    name: "Family Box",
    jars: 4,
    size: "4 × 240 g",
    price: 1790,
    compareAt: 1980,
    badge: "Best value",
    blurb: "A month of honest breakfasts, in a keepsake box.",
  },
];

export const SHOP_PRODUCTS = PRODUCTS;

export function getProduct(id: string): Product {
  const found = PRODUCTS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown product: ${id}`);
  return found;
}

export function formatBDT(n: number): string {
  return `৳${Math.round(n).toLocaleString("en-US")}`;
}

export const FREE_SHIP_THRESHOLD = 1500;

export type ShipZone = "dhaka" | "outside";

export function shippingFee(subtotal: number, zone: ShipZone): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIP_THRESHOLD) return 0;
  return zone === "dhaka" ? 70 : 130;
}

export const PROMOS: Record<string, { label: string; rate: number; cap: number }> = {
  FRESAVA10: { label: "10% off your first order", rate: 0.1, cap: 250 },
};

export function promoDiscount(subtotal: number, code: string): number {
  const p = PROMOS[code.trim().toUpperCase()];
  if (!p) return 0;
  return Math.min(Math.round(subtotal * p.rate), p.cap);
}
