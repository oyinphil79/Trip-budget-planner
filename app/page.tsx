"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ReceiptCard } from "@/components/ReceiptCard";
import { SpendingLog } from "@/components/SpendingLog";
import { ACCEPT, MAX_BYTES, UploadCard } from "@/components/UploadCard";
import type { CategoryId } from "@/lib/categories";
import { DEFAULT_MODEL, isModelId, type ModelId } from "@/lib/models";
import type { LogEntry, ReadResult } from "@/lib/types";

const KEY_STORE = "openai-key";
const LOG_STORE = "receipt-log";
const MODEL_STORE = "receipt-model";
const NO_KEY = "Add your OpenAI API key at the top of the page.";

function load<T>(storage: () => Storage, name: string, fallback: T): T {
  try {
    const raw = storage().getItem(name);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function save(storage: () => Storage, name: string, value: unknown) {
  try {
    storage().setItem(name, JSON.stringify(value));
  } catch {}
}

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<CategoryId>("food");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReadResult | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    try {
      setApiKey(sessionStorage.getItem(KEY_STORE) ?? "");
    } catch {}
    const m = load<unknown>(() => localStorage, MODEL_STORE, DEFAULT_MODEL);
    if (isModelId(m)) setModel(m);
    setLog(load<LogEntry[]>(() => localStorage, LOG_STORE, []));
  }, []);

  function changeKey(k: string) {
    setApiKey(k);
    try {
      if (k) sessionStorage.setItem(KEY_STORE, k);
      else sessionStorage.removeItem(KEY_STORE);
    } catch {}
  }

  function changeModel(m: ModelId) {
    setModel(m);
    save(() => localStorage, MODEL_STORE, m);
  }

  function updateLog(next: LogEntry[]) {
    setLog(next);
    save(() => localStorage, LOG_STORE, next);
  }

  function pickFile(f: File | null) {
    setError(null);
    if (f && !ACCEPT.includes(f.type)) return setError("Use a PDF, PNG, JPG or WEBP file.");
    if (f && f.size > MAX_BYTES) return setError("Files must be 8 MB or smaller.");
    setFile(f);
  }

  async function read() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("model", model);
      const headers: HeadersInit = apiKey.trim() ? { "x-openai-key": apiKey.trim() } : {};
      const res = await fetch("/api/read", { method: "POST", headers, body });
      if (res.status === 401) return setError(NO_KEY);
      const data = await res.json().catch(() => ({ error: "The server sent an unreadable reply." }));
      if (!res.ok) return setError(data.error ?? `Request failed (${res.status}).`);

      const out = data as ReadResult;
      setResult(out);
      setFile(null);
      if (out.fx.source === "none") {
        return setError(`No INR rate for ${out.fx.currency}, so it was not added to the log.`);
      }
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        vendor: out.receipt.vendor,
        date: out.receipt.date,
        currency: out.fx.currency,
        total: out.receipt.total,
        inr: out.fx.inr,
        category,
        match: out.check.match,
      };
      updateLog([entry, ...log]);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header model={model} onModel={changeModel} apiKey={apiKey} onKey={changeKey} />
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="max-w-xl pt-10 pb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">Receipts in, rupees out.</h1>
          <p className="mt-3 text-muted">
            Upload a PDF or photo of a receipt. It is read into JSON, checked line by line, converted to INR and
            added to your spending log.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <UploadCard
              file={file}
              onFile={pickFile}
              category={category}
              onCategory={setCategory}
              busy={busy}
              error={error}
              onRead={read}
            />
            {result && <ReceiptCard result={result} />}
          </div>
          <div className="lg:sticky lg:top-6">
            <SpendingLog
              entries={log}
              onRemove={(id) => updateLog(log.filter((e) => e.id !== id))}
              onClear={() => updateLog([])}
            />
          </div>
        </div>
      </main>
    </>
  );
}
