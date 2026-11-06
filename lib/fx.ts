import { toCents } from "./check";
import type { Fx } from "./types";

/** Rough INR per unit, used only when the live rate cannot be fetched. */
const FALLBACK: Record<string, number> = {
  INR: 1, USD: 88, EUR: 102, GBP: 116, AED: 24, SGD: 68, AUD: 58, CAD: 63,
  JPY: 0.58, CHF: 110, CNY: 12.3, HKD: 11.3, THB: 2.7, MYR: 21, NZD: 51, SAR: 23.5,
};

async function liveRate(currency: string): Promise<{ rate: number; date: string } | null> {
  try {
    const url = `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=INR`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { date?: string; rates?: { INR?: number } };
    const rate = data.rates?.INR;
    return typeof rate === "number" ? { rate, date: data.date ?? "" } : null;
  } catch {
    return null;
  }
}

/** Converts a printed total to INR, in whole paise. */
export async function toInr(currencyRaw: string, total: number): Promise<Fx> {
  const currency = (currencyRaw || "INR").trim().toUpperCase().slice(0, 3);
  const convert = (rate: number) => Math.round(toCents(total) * rate) / 100;
  if (currency === "INR") return { currency, rate: 1, inr: convert(1), source: "live", asOf: null };

  const live = await liveRate(currency);
  if (live) return { currency, rate: live.rate, inr: convert(live.rate), source: "live", asOf: live.date };

  const rate = FALLBACK[currency];
  if (rate) return { currency, rate, inr: convert(rate), source: "fallback", asOf: null };
  return { currency, rate: 0, inr: 0, source: "none", asOf: null };
}
