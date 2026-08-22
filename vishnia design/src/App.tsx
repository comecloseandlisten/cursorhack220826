import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CalendarDock } from './components/CalendarDock'
import { CanvasBoard, type CanvasLayout } from './components/CanvasBoard'
import { MessageWheel } from './components/MessageWheel'
import { TODAY, initialDays } from './data'
import { useNarration } from './hooks/useNarration'
import { eachDay, shiftDay } from './lib/dates'
import { mediaEntries, phraseEntries } from './lib/playlist'
import type { DayEntry } from './types'

const CALENDAR_FROM = '2026-08-10'
const LOCAL_DEMO_DELAY_MS = 5_000
const LOCAL_DEMO_VIDEO: DayEntry = {
  id: 'local-demo-family-video',
  kind: 'video',
  author: 'Family',
  time: '15:18',
  source: 'direct',
  duration: '0:04',
  video: '/videos/family-message.mp4',
  caption: 'A new family video',
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  return Boolean(
    target.closest(
      'input, textarea, select, button, a[href], audio, video, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="dialog"], [role="textbox"], [role="combobox"], [role="listbox"], [role="slider"], [aria-modal="true"]',
    ),
  )
}

function initialDay(): string {
  const queryDay = new URLSearchParams(window.location.search).get('day')
  return queryDay && queryDay >= CALENDAR_FROM && queryDay <= TODAY ? queryDay : TODAY
}

export default function App() {
  const [selected, setSelected] = useState(initialDay)
  const [layout, setLayout] = useState<CanvasLayout>('pile')
  const [openedMediaId, setOpenedMediaId] = useState<string | null>(null)
  const [wheelOpen, setWheelOpen] = useState(false)
  const [readIdsByDay, setReadIdsByDay] = useState<Record<string, string[]>>({})
  const [incomingVideoDay, setIncomingVideoDay] = useState<string | null>(null)
  const [incomingVideoUnread, setIncomingVideoUnread] = useState(false)
  const selectedRef = useRef(selected)
  const demoTriggeredRef = useRef(false)

  const calendarDays = useMemo(() => eachDay(CALENDAR_FROM, TODAY), [])
  const counts = useMemo(() => {
    return initialDays.reduce<Record<string, number>>((acc, day) => {
      acc[day.date] = day.entries.length + (day.date === incomingVideoDay ? 1 : 0)
      return acc
    }, {})
  }, [incomingVideoDay])

  const current = initialDays.find((day) => day.date === selected)
  const currentEntries = useMemo(() => {
    const entries = current?.entries ?? []
    return selected === incomingVideoDay ? [...entries, LOCAL_DEMO_VIDEO] : entries
  }, [current?.entries, incomingVideoDay, selected])
  const media = useMemo(() => mediaEntries(currentEntries), [currentEntries])
  const openedMedia = media.find((entry) => entry.id === openedMediaId) ?? null
  const depth = openedMedia ? 2 : layout === 'grid' ? 1 : 0
  const phrases = useMemo(() => phraseEntries(currentEntries), [currentEntries])
  const { playing, activeId, stop, playOne } = useNarration(phrases, selected)
  const readIds = readIdsByDay[selected] ?? []
  const unreadCount = incomingVideoUnread ? 1 : 0

  function playMessage(entry: DayEntry) {
    setReadIdsByDay((previous) => {
      const dayReadIds = previous[selected] ?? []
      if (dayReadIds.includes(entry.id)) {
        return previous
      }
      return { ...previous, [selected]: [...dayReadIds, entry.id] }
    })
    void playOne(entry)
  }

  function pushNavigation(nextDepth: 1 | 2, photoId?: string) {
    window.history.pushState(
      { frameDepth: nextDepth, photoId: photoId ?? null, wheelOpen: false },
      '',
      window.location.href,
    )
  }

  function openGallery() {
    setWheelOpen(false)
    setOpenedMediaId(null)
    setLayout('grid')
    pushNavigation(1)
  }

  function openPhoto(entry: DayEntry) {
    setWheelOpen(false)
    setOpenedMediaId(entry.id)
    setLayout('grid')
    if (entry.id === LOCAL_DEMO_VIDEO.id) {
      setIncomingVideoUnread(false)
    }
    pushNavigation(2, entry.id)
  }

  function openIncomingVideo() {
    if (!incomingVideoDay) {
      return
    }
    if (selected !== incomingVideoDay) {
      selectDay(incomingVideoDay)
    }
    openPhoto(LOCAL_DEMO_VIDEO)
  }

  const closeOneLevel = useCallback(() => {
    if (wheelOpen || depth > 0) {
      window.history.back()
    }
  }, [wheelOpen, depth])

  function changeWheelOpen(nextOpen: boolean) {
    if (nextOpen) {
      setWheelOpen(true)
      window.history.pushState(
        { frameDepth: depth, photoId: openedMediaId, wheelOpen: true },
        '',
        window.location.href,
      )
      return
    }
    if (window.history.state?.wheelOpen) {
      window.history.back()
    } else {
      setWheelOpen(false)
    }
  }

  useEffect(() => {
    window.history.replaceState(
      { frameDepth: 0, photoId: null, wheelOpen: false },
      '',
      window.location.href,
    )

    function restoreNavigation(event: PopStateEvent) {
      const nextDepth = event.state?.frameDepth === 2 ? 2 : event.state?.frameDepth === 1 ? 1 : 0
      setWheelOpen(Boolean(event.state?.wheelOpen))
      setLayout(nextDepth === 0 ? 'pile' : 'grid')
      setOpenedMediaId(nextDepth === 2 ? (event.state?.photoId ?? null) : null)
    }

    window.addEventListener('popstate', restoreNavigation)
    return () => window.removeEventListener('popstate', restoreNavigation)
  }, [])

  const selectDay = useCallback((iso: string) => {
    if (iso < CALENDAR_FROM || iso > TODAY) {
      return
    }
    stop()
    setSelected(iso)
    const url = new URL(window.location.href)
    url.searchParams.set('day', iso)
    window.history.replaceState(
      { frameDepth: 0, photoId: null, wheelOpen: false },
      '',
      url,
    )
    setWheelOpen(false)
    setOpenedMediaId(null)
    setLayout('pile')
  }, [stop])

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  useEffect(() => {
    const localDemoEnabled =
      import.meta.env.DEV &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

    if (!localDemoEnabled) {
      return
    }

    let deliveryTimer: number | null = null

    function triggerLocalDemo(event: KeyboardEvent) {
      if (
        event.key !== ' ' ||
        event.repeat ||
        demoTriggeredRef.current ||
        document.querySelector('[aria-modal="true"]') !== null ||
        isInteractiveTarget(event.target)
      ) {
        return
      }

      demoTriggeredRef.current = true
      deliveryTimer = window.setTimeout(() => {
        setIncomingVideoDay(selectedRef.current)
        setIncomingVideoUnread(true)
      }, LOCAL_DEMO_DELAY_MS)
    }

    window.addEventListener('keydown', triggerLocalDemo)
    return () => {
      window.removeEventListener('keydown', triggerLocalDemo)
      if (deliveryTimer !== null) {
        window.clearTimeout(deliveryTimer)
      }
    }
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && (wheelOpen || depth > 0)) {
        event.preventDefault()
        closeOneLevel()
        return
      }
      if (depth > 0 || wheelOpen) {
        return
      }
      if (event.key === 'ArrowLeft') {
        selectDay(shiftDay(selected, -1))
      }
      if (event.key === 'ArrowRight') {
        selectDay(shiftDay(selected, 1))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, selectDay, depth, wheelOpen, closeOneLevel])

  return (
    <div className="ambient relative h-dvh overflow-hidden text-ink">
      <a
        href="#family-canvas"
        className="glass sr-only z-[60] rounded-full px-4 py-3 text-sm focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to family memories
      </a>
      <div className="absolute inset-0">
        {media.length > 0 ? (
          <CanvasBoard
            entries={currentEntries}
            layout={layout}
            opened={openedMedia}
            incomingEntryId={incomingVideoDay === selected ? LOCAL_DEMO_VIDEO.id : null}
            onExpandPile={openGallery}
            onOpenPhoto={openPhoto}
            onClosePhoto={closeOneLevel}
          />
        ) : phrases.length > 0 ? (
          <div className="flex h-full items-center justify-center pb-24">
            <MessageWheel
              key={selected}
              prominent
              open={wheelOpen}
              onOpenChange={changeWheelOpen}
              entries={phrases}
              activeId={activeId}
              playing={playing}
              unreadCount={unreadCount}
              readIds={readIds}
              onPlay={playMessage}
              onOpenUnread={openIncomingVideo}
              onStop={stop}
            />
          </div>
        ) : (
          <p className="flex h-full items-center justify-center px-6 pb-24 text-center text-sm text-muted">
            Nothing shared this day.
          </p>
        )}
      </div>

      <div className="bottom-dock pointer-events-none absolute z-50 flex justify-center">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          {media.length > 0 && (phrases.length > 0 || unreadCount > 0) ? (
            <MessageWheel
              key={selected}
              open={wheelOpen}
              onOpenChange={changeWheelOpen}
              entries={phrases}
              activeId={activeId}
              playing={playing}
              unreadCount={unreadCount}
              readIds={readIds}
              onPlay={playMessage}
              onOpenUnread={openIncomingVideo}
              onStop={stop}
            />
          ) : null}
          {depth > 0 ? (
            <button
              type="button"
              onClick={closeOneLevel}
              data-wheel-back
              className="glass glass-btn flex h-14 cursor-pointer items-center rounded-full px-7 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              aria-label="Back"
            >
              Back
            </button>
          ) : (
            <CalendarDock
              days={calendarDays}
              selected={selected}
              counts={counts}
              onSelect={selectDay}
              onShift={(delta) => selectDay(shiftDay(selected, delta))}
            />
          )}
        </div>
      </div>
    </div>
  )
}
