import type { ReasoningEffort } from "openai/resources/shared";

/**
 * Models offered in the switch, with the lowest reasoning effort each accepts.
 * Change a row here to change the model or its effort everywhere.
 */
export const MODELS = {
  "gpt-5-mini": { label: "GPT-5 mini", note: "Default", effort: "minimal" },
  "gpt-6.1-sol": { label: "GPT-6.1 Sol", note: "Cheaper", effort: "none" },
} as const satisfies Record<string, { label: string; note: string; effort: ReasoningEffort }>;

export type ModelId = keyof typeof MODELS;
export const DEFAULT_MODEL: ModelId = "gpt-5-mini";

export function isModelId(v: unknown): v is ModelId {
  return typeof v === "string" && v in MODELS;
}
