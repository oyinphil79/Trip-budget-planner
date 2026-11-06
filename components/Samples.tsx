"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SAMPLES, loadSample } from "@/lib/samples";

type Props = { current: string | null; onFile: (f: File | null) => void; onError: (msg: string) => void };

export function Samples({ current, onFile, onError }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function pick(id: string) {
    setLoading(id);
    try {
      onFile(await loadSample(id));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not load the sample invoice.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-muted">Or try a sample</span>
      {SAMPLES.map((s) => (
        <button
          key={s.id}
          className="chip"
          aria-pressed={current === s.file}
          disabled={loading !== null}
          onClick={() => pick(s.id)}
        >
          {loading === s.id ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className="dot" style={{ background: s.color }} />
          )}
          {s.label}
        </button>
      ))}
    </div>
  );
}
