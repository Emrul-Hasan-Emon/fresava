"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { extraCurrencies, type ExtraCurrency } from "@shared/contracts";

export type Market = "BD" | ExtraCurrency;
export const MARKETS: { code: Market; label: string }[] = [
  { code: "BD", label: "৳ BDT" },
  ...extraCurrencies.map((c) => ({ code: c as Market, label: c })),
];
const VALID_MARKETS = new Set<string>(MARKETS.map((m) => m.code));
const STORAGE_KEY = "fresava_market";

const MarketContext = createContext<{
  market: Market;
  setMarket: (m: Market) => void;
}>({ market: "BD", setMarket: () => {} });

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarketState] = useState<Market>("BD");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Browser-only persisted state is loaded after the matching SSR render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored && VALID_MARKETS.has(stored)) setMarketState(stored as Market);
    } catch {}
  }, []);

  function setMarket(m: Market) {
    setMarketState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {}
  }

  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}
