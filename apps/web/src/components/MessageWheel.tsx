import { Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
  type WheelEvent,
} from "react";

import { phraseText } from "../lib/playlist";
import type { DayEntry } from "../types/canvas";

type MessageWheelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: DayEntry[];
  activeId: string | null;
  playing: boolean;
  prominent?: boolean;
  unreadCount: number;
  readIds: string[];
  onPlay: (entry: DayEntry) => void;
  onStop: () => void;
};

export function MessageWheel({
  open,
  onOpenChange,
  entries,
  activeId,
  playing,
  prominent = false,
  unreadCount,
  readIds,
  onPlay,
  onStop,
}: MessageWheelProps) {
  const [selected, setSelected] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelDelta = useRef(0);
  const wheelLocked = useRef(false);
  const wheelUnlockTimer = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const safeSelected = Math.min(selected, Math.max(0, entries.length - 1));
  const unreadLabel = `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`;
  const visibleIndices = [
    safeSelected,
    safeSelected - 1,
    safeSelected + 1,
    safeSelected - 2,
    safeSelected + 2,
    safeSelected - 3,
    safeSelected + 3,
  ]
    .filter(
      (index, position, values) =>
        index >= 0 && index < entries.length && values.indexOf(index) === position,
    )
    .slice(0, 4);

  useEffect(
    () => () => {
      if (wheelUnlockTimer.current !== null) {
        window.clearTimeout(wheelUnlockTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: PointerEvent) {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("[data-wheel-back]")
      ) {
        return;
      }
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open, onOpenChange]);

  function stepSelection(direction: 1 | -1) {
    if (entries.length < 2) return;
    setSelected((value) => Math.min(entries.length - 1, Math.max(0, value + direction)));
  }

  function scroll(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    if (wheelLocked.current || entries.length < 2) return;

    wheelDelta.current += event.deltaY;
    if (Math.abs(wheelDelta.current) < 32) return;

    const direction = wheelDelta.current > 0 ? 1 : -1;
    wheelDelta.current = 0;
    wheelLocked.current = true;
    stepSelection(direction);
    wheelUnlockTimer.current = window.setTimeout(() => {
      wheelLocked.current = false;
      wheelUnlockTimer.current = null;
    }, 140);
  }

  function moveWithKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      stepSelection(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      stepSelection(-1);
    }
    if ((event.key === "Enter" || event.key === " ") && entries[safeSelected]) {
      event.preventDefault();
      onPlay(entries[safeSelected]);
    }
  }

  function startTouch(event: TouchEvent<HTMLDivElement>) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function endTouch(event: TouchEvent<HTMLDivElement>) {
    const startY = touchStartY.current;
    const endY = event.changedTouches[0]?.clientY;
    touchStartY.current = null;
    if (startY === null || endY === undefined || Math.abs(endY - startY) < 24) return;
    stepSelection(endY < startY ? 1 : -1);
  }

  function toggle() {
    if (!open) {
      const firstUnread = entries.findIndex((entry) => !readIds.includes(entry.id));
      if (firstUnread >= 0) setSelected(firstUnread);
      onOpenChange(true);
      return;
    }
    if (playing) {
      onStop();
      return;
    }
    const entry = entries[safeSelected];
    if (entry) onPlay(entry);
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onWheel={scroll}
      onTouchStart={startTouch}
      onTouchEnd={endTouch}
    >
      {open ? (
        <div
          className="wheel-track pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2"
          role="listbox"
          aria-label="Messages from this day"
          tabIndex={0}
          onKeyDown={moveWithKeys}
        >
          {entries.map((entry, index) => {
            const depth = visibleIndices.indexOf(index);
            const isSelected = index === safeSelected;
            const isActive = entry.id === activeId;

            return (
              <button
                key={entry.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setSelected(index);
                  onPlay(entry);
                }}
                data-depth={depth}
                data-selected={isSelected}
                data-playing={isActive}
                className="glass wheel-capsule pointer-events-auto absolute bottom-7 left-1/2 w-[min(360px,calc(100vw-3rem))] cursor-pointer rounded-full px-5 py-3 text-left text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                style={{
                  zIndex: 20 - Math.max(0, depth),
                  visibility: depth >= 0 ? "visible" : "hidden",
                }}
              >
                <span
                  className={`block ${
                    isSelected
                      ? "line-clamp-2 text-base leading-5 font-semibold"
                      : "truncate text-xs font-medium"
                  }`}
                >
                  {phraseText(entry)}
                </span>
                <span
                  className={`mt-1 block text-xs text-muted ${isSelected ? "" : "truncate"}`}
                >
                  {entry.author} · {entry.time}
                  {isActive ? " · playing" : ""}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        disabled={entries.length === 0}
        className={`glass glass-btn relative z-30 flex cursor-pointer items-center justify-center rounded-full text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          prominent ? "size-24" : "size-14 sm:size-16"
        }`}
        aria-label={`${
          !open ? "Open messages" : playing ? "Stop playback" : "Play selected message"
        }, ${unreadLabel}`}
        aria-expanded={open}
      >
        {playing ? (
          <Pause aria-hidden="true" size={prominent ? 30 : 22} />
        ) : (
          <Play aria-hidden="true" size={prominent ? 30 : 22} className="ml-0.5" />
        )}
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-[10px] leading-none font-semibold text-white shadow-sm"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
