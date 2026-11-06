import OpenAI from "openai";
import type { ResponseInputContent } from "openai/resources/responses/responses";
import { MODELS, type ModelId } from "./models";
import type { Receipt } from "./types";

const money = { type: "number" };
const nullableNumber = { type: ["number", "null"] };

/** Strict schema: every field required, nothing extra. Missing values come back as null. */
const RECEIPT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["vendor", "number", "date", "currency", "items", "taxes", "total"],
  properties: {
    vendor: { type: "string", description: "Business name as printed." },
    number: { type: ["string", "null"], description: "Receipt or invoice number, or null." },
    date: { type: ["string", "null"], description: "Date as YYYY-MM-DD, or null if not printed." },
    currency: { type: "string", description: "ISO 4217 code, e.g. INR, USD, EUR." },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "qty", "rate", "amount"],
        properties: { name: { type: "string" }, qty: nullableNumber, rate: nullableNumber, amount: money },
      },
    },
    taxes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "amount"],
        properties: { name: { type: "string" }, amount: money },
      },
    },
    total: { ...money, description: "The grand total as printed." },
  },
} as const;

const INSTRUCTIONS = `You read receipts and invoices into JSON.
- Copy every number exactly as printed. Do not recalculate, round, or fix the arithmetic, even if it looks wrong.
- items: one entry per printed line item. amount is the printed line amount. qty and rate are null when not printed.
- Discounts printed as their own line go in items with a negative amount.
- taxes: each printed tax, service charge or fee that sits below the subtotal (GST, CGST, SGST, VAT, tip...).
- Do not include subtotals or the grand total in items or taxes.
- total: the final amount payable as printed.
- currency: the ISO code printed, or implied by the symbol and address (₹ → INR, $ in the US → USD).`;

export type Upload = { name: string; mime: string; base64: string };

function filePart(file: Upload): ResponseInputContent {
  const dataUrl = `data:${file.mime};base64,${file.base64}`;
  if (file.mime === "application/pdf") {
    return { type: "input_file", filename: file.name || "receipt.pdf", file_data: dataUrl };
  }
  return { type: "input_image", image_url: dataUrl, detail: "high" };
}

/** Sends one receipt to OpenAI and returns the parsed JSON. */
export async function readReceipt(apiKey: string, model: ModelId, file: Upload): Promise<Receipt> {
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    instructions: INSTRUCTIONS,
    reasoning: { effort: MODELS[model].effort },
    input: [
      {
        role: "user",
        content: [filePart(file), { type: "input_text", text: "Read this receipt." }],
      },
    ],
    text: {
      format: { type: "json_schema", name: "receipt", strict: true, schema: RECEIPT_SCHEMA },
    },
  });

  const text = response.output_text;
  if (!text) throw new Error("The model returned no output.");
  return JSON.parse(text) as Receipt;
}
