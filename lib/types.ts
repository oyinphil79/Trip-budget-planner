export type Item = { name: string; qty: number | null; rate: number | null; amount: number };
export type Tax = { name: string; amount: number };

export type Receipt = {
  vendor: string;
  number: string | null;
  date: string | null;
  currency: string;
  items: Item[];
  taxes: Tax[];
  total: number;
};

export type Check = {
  linesCents: number;
  taxCents: number;
  computedCents: number;
  printedCents: number;
  gapCents: number;
  match: boolean;
};

export type Fx = {
  currency: string;
  rate: number;
  inr: number;
  source: "live" | "fallback" | "none";
  asOf: string | null;
};

export type ReadResult = { receipt: Receipt; check: Check; fx: Fx; model: string; fileName: string };

export type LogEntry = {
  id: string;
  at: string;
  vendor: string;
  date: string | null;
  currency: string;
  total: number;
  inr: number;
  category: string;
  match: boolean;
};
