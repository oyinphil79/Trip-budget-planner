"use client";

import { Trash2, Wallet } from "lucide-react";
import { CATEGORIES, categoryColor } from "@/lib/categories";
import { formatCents, toCents } from "@/lib/check";
import type { LogEntry } from "@/lib/types";

type Props = { entries: LogEntry[]; onRemove: (id: string) => void; onClear: () => void };

export function SpendingLog({ entries, onRemove, onClear }: Props) {
  const totalCents = entries.reduce((s, e) => s + toCents(e.inr), 0);
  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    cents: entries.filter((e) => e.category === c.id).reduce((s, e) => s + toCents(e.inr), 0),
  })).filter((c) => c.cents > 0);

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <p className="label flex items-center gap-2">
          <Wallet className="size-3.5" strokeWidth={1.75} /> Spending log
        </p>
        {entries.length > 0 && (
          <button onClick={onClear} className="text-xs text-muted hover:text-ink">
            Clear
          </button>
        )}
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">₹{formatCents(totalCents)}</p>
      <p className="mt-1 text-xs text-muted">
        {entries.length} {entries.length === 1 ? "receipt" : "receipts"} · saved in this browser
      </p>

      {byCategory.length > 0 && (
        <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-paper">
          {byCategory.map((c) => (
            <span key={c.id} title={c.label} style={{ width: `${(c.cents / totalCents) * 100}%`, background: c.color }} />
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <p className="mt-8 mb-2 text-center text-sm text-muted">Receipts you read will show up here.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {entries.map((e) => (
            <li key={e.id} className="group flex items-center gap-3 py-3">
              <span className="dot" style={{ background: categoryColor(e.category) }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.vendor || "Unknown vendor"}</p>
                <p className="text-xs text-muted">
                  {e.date ?? "No date"}
                  {e.currency !== "INR" && ` · ${e.currency} ${formatCents(toCents(e.total))}`}
                  {!e.match && " · total doesn't add up"}
                </p>
              </div>
              <span className="text-sm tabular-nums">₹{formatCents(toCents(e.inr))}</span>
              <button
                aria-label={`Remove ${e.vendor}`}
                onClick={() => onRemove(e.id)}
                className="text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink focus:opacity-100"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
