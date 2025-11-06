import { useLexicon } from "../state/useLexicon";
import { generateEasy } from "./templates/easy";
import { miniGenerate } from "./minigen";
import type { Card } from "../types";

// Single entry used by the UI
export function generate(n: number): Card[] {
  const rows = useLexicon.getState().rows;
  if (rows.length >= 10) return generateEasy(n);
  return miniGenerate(n);
}
