import type { DayEntry } from "../types/canvas";

const byTime = (left: DayEntry, right: DayEntry) => left.time.localeCompare(right.time);

export function mediaEntries(entries: DayEntry[]): DayEntry[] {
  return entries.filter((entry) => entry.kind === "photo" || entry.kind === "video");
}

export function phraseEntries(entries: DayEntry[]): DayEntry[] {
  const voice = entries.filter((entry) => entry.kind === "voice").sort(byTime);
  const notes = entries.filter((entry) => entry.kind === "note").sort(byTime);
  return [...voice, ...notes];
}

export function phraseText(entry: DayEntry): string {
  return entry.body ?? entry.caption ?? "";
}
