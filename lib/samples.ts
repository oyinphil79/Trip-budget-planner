import type { StaticImageData } from "next/image";
import invoice1 from "@/app/assets/invoice-1.png";
import invoice2 from "@/app/assets/invoice-2.png";

/** Sample invoices offered as presets; the colour is the chip's dot. */
export const SAMPLES: { id: string; label: string; file: string; color: string; image: StaticImageData }[] = [
  { id: "acme", label: "Acme Solutions", file: "invoice-1.png", color: "#3f9d6a", image: invoice1 },
  { id: "cloudflow", label: "CloudFlow", file: "invoice-2.png", color: "#5b8de5", image: invoice2 },
];

/** Fetches a bundled sample and wraps it as a File, as if the visitor had uploaded it. */
export async function loadSample(id: string): Promise<File> {
  const sample = SAMPLES.find((s) => s.id === id);
  if (!sample) throw new Error(`Unknown sample: ${id}`);
  const res = await fetch(sample.image.src);
  if (!res.ok) throw new Error("Could not load the sample invoice.");
  const blob = await res.blob();
  return new File([blob], sample.file, { type: "image/png" });
}
