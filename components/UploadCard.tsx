"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, ScanText, Upload, X } from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { Samples } from "./Samples";

export const ACCEPT = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
export const MAX_BYTES = 8 * 1024 * 1024;

type Props = {
  file: File | null;
  onFile: (f: File | null) => void;
  category: CategoryId;
  onCategory: (c: CategoryId) => void;
  busy: boolean;
  error: string | null;
  onRead: () => void;
  onError: (msg: string) => void;
};

export function UploadCard({ file, onFile, category, onCategory, busy, error, onRead, onError }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const Icon = file?.type === "application/pdf" ? FileText : ImageIcon;

  return (
    <section className="card p-6">
      <div
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFile(e.dataTransfer.files[0] ?? null);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
          over ? "border-ink bg-paper" : "border-line hover:bg-paper/60"
        }`}
      >
        <span className="mb-3 grid size-10 place-items-center rounded-full bg-paper">
          <Upload className="size-4 text-muted" strokeWidth={1.75} />
        </span>
        <p className="text-sm font-medium">Drop a receipt here, or click to choose</p>
        <p className="mt-1 text-xs text-muted">PDF, PNG, JPG or WEBP · up to 8 MB</p>
        <input
          ref={input}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>

      <Samples current={file?.name ?? null} onFile={onFile} onError={onError} />

      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm">
          <Icon className="size-4 text-muted" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <span className="text-xs text-muted">{(file.size / 1024).toFixed(0)} KB</span>
          <button aria-label="Remove file" onClick={() => onFile(null)} className="text-muted hover:text-ink">
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      <div className="mt-5">
        <p className="label mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="chip" aria-pressed={c.id === category} onClick={() => onCategory(c.id)}>
              <span className="dot" style={{ background: c.color }} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p role="alert" className="text-sm text-peach">
          {error}
        </p>
        <button className="pill-dark shrink-0" disabled={!file || busy} onClick={onRead}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ScanText className="size-4" strokeWidth={1.75} />}
          {busy ? "Reading…" : "Read receipt"}
        </button>
      </div>
    </section>
  );
}
