// Public catalog preview for prerendering. Never used by the backend to price an order.
export interface MarketPrice {
  currency: string;
  price: number;
  compareAt?: number;
}
export interface Product {
  id: string;
  name: string;
  jars: number;
  size: string;
  price: number;
  compareAt?: number;
  prices: MarketPrice[];
  badge?: string;
  blurb: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "single",
    name: "Signature Jar",
    jars: 1,
    size: "1 × 340 g",
    price: 495,
    prices: [],
    blurb: "One jar of Dragon Fruit Spread. Start here.",
  },
  {
    id: "duo",
    name: "The Pair",
    jars: 2,
    size: "2 × 340 g",
    price: 940,
    compareAt: 990,
    prices: [],
    badge: "Most loved",
    blurb: "One for toast, one for yoghurt. Or one for a friend.",
  },
  {
    id: "family",
    name: "Family Box",
    jars: 4,
    size: "4 × 340 g",
    price: 1790,
    compareAt: 1980,
    prices: [],
    badge: "Best value",
    blurb: "A month of honest breakfasts, in a keepsake box.",
  },
];

export function formatBDT(n: number): string {return `৳${Math.round(n).toLocaleString("en-US")}`;}
export function formatCurrency(n: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}
