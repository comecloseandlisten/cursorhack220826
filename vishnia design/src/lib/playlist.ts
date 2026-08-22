import type { DayEntry } from '../types'

function byTime(left: DayEntry, right: DayEntry): number {
  return left.time.localeCompare(right.time)
}

export function mediaEntries(entries: DayEntry[]): DayEntry[] {
  return entries.filter((entry) => entry.kind === 'photo' || entry.kind === 'video')
}

export function phraseEntries(entries: DayEntry[]): DayEntry[] {
  return [...entries.filter((entry) => entry.kind === 'voice').sort(byTime), ...entries.filter((entry) => entry.kind === 'note').sort(byTime)]
}

export function phraseText(entry: DayEntry): string {
  switch (entry.kind) {
    case 'voice':
    case 'note':
      return entry.body ?? ''
    case 'photo':
    case 'video':
      return entry.caption ?? ''
    default: {
      const _exhaustive: never = entry.kind
      return _exhaustive
    }
  }
}
