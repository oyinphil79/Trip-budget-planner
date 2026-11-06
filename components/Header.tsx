"use client";

import { KeyRound, ReceiptText } from "lucide-react";
import { MODELS, type ModelId } from "@/lib/models";

type Props = {
  model: ModelId;
  onModel: (m: ModelId) => void;
  apiKey: string;
  onKey: (k: string) => void;
};

export function Header({ model, onModel, apiKey, onKey }: Props) {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-ink text-white">
          <ReceiptText className="size-4" strokeWidth={1.75} />
        </span>
        <span className="font-semibold tracking-tight">Receipt Agent</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex items-center">
          <KeyRound className="pointer-events-none absolute left-3 size-3.5 text-muted" strokeWidth={1.75} />
          <span className="sr-only">OpenAI API key</span>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="OpenAI API key"
            value={apiKey}
            onChange={(e) => onKey(e.target.value)}
            className="field w-52 pl-8"
          />
        </label>

        <div role="radiogroup" aria-label="Model" className="flex rounded-full border border-line bg-white p-1">
          {(Object.keys(MODELS) as ModelId[]).map((id) => {
            const active = id === model;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={active}
                onClick={() => onModel(id)}
                className={`rounded-full px-3 py-1 text-[13px] transition-colors ${
                  active ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                {MODELS[id].label}
                <span className={`ml-1.5 text-[11px] ${active ? "text-white/60" : "text-muted/70"}`}>
                  {MODELS[id].note}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
