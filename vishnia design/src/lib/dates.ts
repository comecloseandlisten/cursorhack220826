export function parseDay(iso: string): Date {
  return new Date(`${iso}T12:00:00`)
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(parseDay(iso))
}

export function formatShortDay(iso: string): string {
  return String(parseDay(iso).getDate())
}

export function eachDay(fromIso: string, toIso: string): string[] {
  const cursor = parseDay(fromIso)
  const end = parseDay(toIso)
  const days: string[] = []

  while (cursor <= end) {
    const month = String(cursor.getMonth() + 1).padStart(2, '0')
    const day = String(cursor.getDate()).padStart(2, '0')
    days.push(`${cursor.getFullYear()}-${month}-${day}`)
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function shiftDay(iso: string, delta: number): string {
  const date = parseDay(iso)
  date.setDate(date.getDate() + delta)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
