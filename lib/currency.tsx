"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CurrencyCode = "USD" | "KHR";

interface CurrencyContextValue {
  currency: CurrencyCode;
  exchangeRate: number;
  setCurrency: (c: CurrencyCode) => void;
  toggle: () => void;
  format: (usd: number) => string;
  toKhr: (usd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "genztopup:currency";

export function CurrencyProvider({
  children,
  exchangeRate,
}: {
  children: React.ReactNode;
  exchangeRate: number;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "USD" || saved === "KHR") {
        setCurrencyState(saved);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCurrency(currency === "USD" ? "KHR" : "USD");
  }, [currency, setCurrency]);

  const toKhr = useCallback(
    (usd: number) => Math.round((usd * exchangeRate) / 100) * 100,
    [exchangeRate]
  );

  const format = useCallback(
    (usd: number) => {
      if (currency === "KHR") {
        return `${toKhr(usd).toLocaleString("en-US")} ៛`;
      }
      return `$${usd.toFixed(2)}`;
    },
    [currency, toKhr]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, exchangeRate, setCurrency, toggle, format, toKhr }),
    [currency, exchangeRate, setCurrency, toggle, format, toKhr]
  );

  void hydrated;

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
