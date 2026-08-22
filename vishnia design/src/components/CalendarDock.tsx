import { useEffect, useRef, useState } from 'react'

import { formatLongDate } from '../lib/dates'
import { CalendarRail } from './CalendarRail'

type CalendarDockProps = {
  days: string[]
  selected: string
  counts: Record<string, number>
  onSelect: (iso: string) => void
  onShift: (delta: number) => void
}

export function CalendarDock({
  days,
  selected,
  counts,
  onSelect,
  onShift,
}: CalendarDockProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function closeOnOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutside)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="flex justify-center">
      {open ? (
        <div className="w-[min(720px,calc(100vw-2rem))]">
          <CalendarRail
            days={days}
            selected={selected}
            counts={counts}
            onSelect={(iso) => {
              onSelect(iso)
              setOpen(false)
            }}
            onShift={onShift}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="glass glass-btn h-14 cursor-pointer rounded-full px-7 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          aria-label="Open calendar"
          aria-expanded={false}
        >
          {formatLongDate(selected)}
        </button>
      )}
    </div>
  )
}
