"use client";

import { useState } from "react";
import { Braces, CircleAlert, CircleCheck, IndianRupee, Table2 } from "lucide-react";
import { formatCents, toCents } from "@/lib/check";
import { MODELS } from "@/lib/models";
import type { ReadResult } from "@/lib/types";

const fmt = (n: number | null) => (n === null ? "—" : formatCents(toCents(n)));

export function ReceiptCard({ result }: { result: ReadResult }) {
  const [view, setView] = useState<"table" | "json">("table");
  const { receipt: r, check, fx } = result;
  const cur = r.currency;

  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight">{r.vendor || "Unknown vendor"}</h2>
          <p className="mt-0.5 text-xs text-muted">
            {[r.date, r.number && `No. ${r.number}`, cur, MODELS[result.model as keyof typeof MODELS]?.label]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <button className="pill-light" onClick={() => setView(view === "table" ? "json" : "table")}>
          {view === "table" ? <Braces className="size-3.5" /> : <Table2 className="size-3.5" />}
          {view === "table" ? "JSON" : "Table"}
        </button>
      </div>

      {view === "json" ? (
        <pre className="mt-5 max-h-96 overflow-auto rounded-xl bg-paper p-4 font-mono text-xs leading-relaxed">
          {JSON.stringify(r, null, 2)}
        </pre>
      ) : (
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="label text-left">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Rate</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {r.items.map((i, n) => (
              <tr key={n} className="border-t border-line">
                <td className="py-2 pr-2">{i.name}</td>
                <td className="py-2 text-right text-muted">{i.qty ?? "—"}</td>
                <td className="py-2 text-right text-muted">{fmt(i.rate)}</td>
                <td className="py-2 text-right">{fmt(i.amount)}</td>
              </tr>
            ))}
            {r.taxes.map((t, n) => (
              <tr key={`t${n}`} className="border-t border-line text-muted">
                <td className="py-2" colSpan={3}>{t.name}</td>
                <td className="py-2 text-right">{fmt(t.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-ink/80 font-medium">
              <td className="pt-3" colSpan={3}>Printed total</td>
              <td className="pt-3 text-right">{cur} {fmt(r.total)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div
        className={`mt-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
          check.match ? "bg-mint/10 text-mint" : "bg-peach/10 text-peach"
        }`}
      >
        {check.match ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <CircleAlert className="mt-0.5 size-4 shrink-0" />}
        <p>
          {check.match ? "Adds up. " : `Off by ${cur} ${formatCents(check.gapCents)}. `}
          <span className="text-ink/60">
            Lines {formatCents(check.linesCents)} + tax {formatCents(check.taxCents)} ={" "}
            {formatCents(check.computedCents)}, printed {formatCents(check.printedCents)}.
          </span>
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-line px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-muted">
          <IndianRupee className="size-4" strokeWidth={1.75} /> In rupees
        </span>
        <span className="text-right">
          <span className="font-semibold tabular-nums">
            {fx.source === "none" ? "No rate" : `₹${formatCents(toCents(fx.inr))}`}
          </span>
          {cur !== "INR" && fx.source !== "none" && (
            <span className="block text-[11px] text-muted">
              1 {cur} = ₹{fx.rate} · {fx.source === "live" ? `rate of ${fx.asOf}` : "approximate rate"}
            </span>
          )}
        </span>
      </div>
    </section>
  );
}
