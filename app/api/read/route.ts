import { APIError } from "openai";
import { readReceipt } from "@/lib/agent";
import { checkReceipt } from "@/lib/check";
import { toInr } from "@/lib/fx";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import type { ReadResult } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const NO_KEY = "Add your OpenAI API key at the top of the page.";

/** Accepted types, with the leading bytes each file must start with. */
const TYPES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF....WEBP
};

function sniff(mime: string, bytes: Uint8Array): boolean {
  const ok = TYPES[mime]?.some((sig) => sig.every((b, i) => bytes[i] === b)) ?? false;
  if (ok && mime === "image/webp") return String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return ok;
}

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

/** Removes anything that looks like a key from messages we pass back to the browser. */
function scrub(message: string): string {
  return message.replace(/sk-[\w*-]+/g, "[key]");
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-openai-key")?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return fail(401, NO_KEY);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Send the receipt as a form upload.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail(400, "Choose a PDF or image first.");
  if (!(file.type in TYPES)) return fail(415, "Use a PDF, PNG, JPG or WEBP file.");
  if (file.size === 0) return fail(400, "That file is empty.");
  if (file.size > MAX_BYTES) return fail(413, "Files must be 8 MB or smaller.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!sniff(file.type, bytes)) return fail(415, "The file's contents don't match its type.");

  const modelField = form.get("model");
  const model = isModelId(modelField) ? modelField : DEFAULT_MODEL;

  try {
    const receipt = await readReceipt(apiKey, model, {
      name: file.name,
      mime: file.type,
      base64: Buffer.from(bytes).toString("base64"),
    });
    const result: ReadResult = {
      receipt,
      check: checkReceipt(receipt),
      fx: await toInr(receipt.currency, receipt.total),
      model,
      fileName: file.name,
    };
    return Response.json(result);
  } catch (err) {
    if (err instanceof APIError) {
      if (err.status === 401) return fail(401, NO_KEY);
      return fail(err.status ?? 502, scrub(err.message));
    }
    if (err instanceof SyntaxError) return fail(502, "The model's reply was not valid JSON.");
    return fail(500, "Something went wrong while reading the receipt.");
  }
}
