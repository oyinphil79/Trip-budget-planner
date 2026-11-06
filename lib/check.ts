import type { Check, Receipt } from "./types";

/** Printed money values have at most two decimals, so rounding to whole cents is exact. */
export function toCents(n: number): number {
  return Math.round(n * 100);
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100).toLocaleString("en-IN");
  return `${sign}${whole}.${String(abs % 100).padStart(2, "0")}`;
}

/** Adds the line amounts and taxes in integer cents and compares them with the printed total. */
export function checkReceipt(r: Receipt): Check {
  const linesCents = r.items.reduce((sum, i) => sum + toCents(i.amount), 0);
  const taxCents = r.taxes.reduce((sum, t) => sum + toCents(t.amount), 0);
  const computedCents = linesCents + taxCents;
  const printedCents = toCents(r.total);
  const gapCents = printedCents - computedCents;
  return { linesCents, taxCents, computedCents, printedCents, gapCents, match: gapCents === 0 };
}
