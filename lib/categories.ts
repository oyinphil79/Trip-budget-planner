/** Preset categories shown as chips; the colour is the chip's dot. */
export const CATEGORIES = [
  { id: "food", label: "Food", color: "#e58a5b" },
  { id: "travel", label: "Travel", color: "#5b8de5" },
  { id: "stay", label: "Stay", color: "#9a6fd6" },
  { id: "office", label: "Office", color: "#3f9d6a" },
  { id: "other", label: "Other", color: "#a8a297" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryColor(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.color ?? "#a8a297";
}
