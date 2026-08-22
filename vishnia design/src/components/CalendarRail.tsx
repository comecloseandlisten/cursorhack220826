import { ChevronLeft, ChevronRight } from 'lucide-react'

import { formatShortDay } from '../lib/dates'

type CalendarRailProps = {
  days: string[]
  selected: string
  counts: Record<string, number>
  onSelect: (iso: string) => void
  onShift: (delta: number) => void
}

export function CalendarRail({
  days,
  selected,
  counts,
  onSelect,
  onShift,
}: CalendarRailProps) {
  return (
    <nav aria-label="Days" className="glass flex items-center gap-1 rounded-full p-1.5">
      <button
        type="button"
        onClick={() => onShift(-1)}
        className="glass-btn flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
        aria-label="Previous day"
      >
        <ChevronLeft aria-hidden="true" size={18} />
      </button>
      <div className="flex min-w-0 flex-1 justify-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {days.map((iso) => {
          const active = iso === selected
          const count = counts[iso] ?? 0

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`flex size-10 shrink-0 cursor-pointer flex-col items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:size-11 ${
                active ? 'bg-white/85 text-ink shadow-sm' : 'text-muted hover:bg-white/35'
              }`}
              aria-current={active ? 'date' : undefined}
              aria-label={`${iso}${count ? `, ${count}` : ''}`}
            >
              {formatShortDay(iso)}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => onShift(1)}
        className="glass-btn flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
        aria-label="Next day"
      >
        <ChevronRight aria-hidden="true" size={18} />
      </button>
    </nav>
  )
}
