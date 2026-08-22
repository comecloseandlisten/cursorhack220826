import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatLongDate, formatShortDay } from "../lib/dates";

type CalendarDockProps = {
  days: string[];
  selected: string;
  counts: Record<string, number>;
  onSelect: (iso: string) => void;
  onShift: (delta: number) => void;
};

function CalendarRail({
  days,
  selected,
  counts,
  onSelect,
  onShift,
}: CalendarDockProps) {
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
          const active = iso === selected;
          const count = counts[iso] ?? 0;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`flex size-10 shrink-0 cursor-pointer flex-col items-center justify-center rounded-full text-sm tabular-nums transition-[transform,background-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:size-11 ${
                active
                  ? "bg-white/85 text-ink shadow-sm"
                  : "text-muted hover:-translate-y-0.5 hover:bg-white/35"
              }`}
              aria-current={active ? "date" : undefined}
              aria-label={`${iso}${count ? `, ${count} messages` : ", no messages"}`}
            >
              {formatShortDay(iso)}
            </button>
          );
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
  );
}

export function CalendarDock(props: CalendarDockProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="flex justify-center">
      {open ? (
        <div className="w-[min(720px,calc(100vw-2rem))]">
          <CalendarRail
            {...props}
            onSelect={(iso) => {
              props.onSelect(iso);
              setOpen(false);
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="glass glass-btn h-14 cursor-pointer rounded-full px-7 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          aria-label="Open calendar"
          aria-expanded={open}
        >
          {formatLongDate(props.selected)}
        </button>
      )}
    </div>
  );
}
