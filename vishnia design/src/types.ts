export type EntryKind = 'photo' | 'video' | 'note' | 'voice'
export type EntrySource = 'chat' | 'direct'

export type DayEntry = {
  id: string
  kind: EntryKind
  author: string
  time: string
  source: EntrySource
  caption?: string
  body?: string
  image?: string
  duration?: string
}

export type ChronicleDay = {
  date: string
  entries: DayEntry[]
}
