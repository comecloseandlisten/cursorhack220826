import { useEffect, useMemo, useRef, type MouseEvent } from 'react'

import { mediaEntries } from '../lib/playlist'
import type { DayEntry } from '../types'
import { CanvasItem } from './CanvasItem'

export type CanvasLayout = 'pile' | 'grid'

type CanvasBoardProps = {
  entries: DayEntry[]
  layout: CanvasLayout
  opened: DayEntry | null
  incomingEntryId: string | null
  onExpandPile: () => void
  onOpenPhoto: (entry: DayEntry) => void
  onClosePhoto: () => void
}

export function CanvasBoard({
  entries,
  layout,
  opened,
  incomingEntryId,
  onExpandPile,
  onOpenPhoto,
  onClosePhoto,
}: CanvasBoardProps) {
  const media = useMemo(() => mediaEntries(entries), [entries])
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    return () => {
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
  }, [opened?.id])

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClosePhoto()
    }
  }

  return (
    <main
      id="family-canvas"
      tabIndex={-1}
      className="relative h-full min-h-0 w-full overflow-hidden overscroll-contain"
    >
      {layout === 'pile' ? (
        <button
          type="button"
          onClick={onExpandPile}
          className="absolute top-[36%] left-1/2 aspect-[5/4] w-[min(520px,78vw)] -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          aria-label="Open photo gallery"
        >
          {media.map((entry, index) => (
            <CanvasItem
              key={entry.id}
              entry={entry}
              piled
              index={index}
              incoming={entry.id === incomingEntryId}
            />
          ))}
        </button>
      ) : (
        <div className="absolute inset-0 grid h-full w-full grid-cols-1 gap-1.5 overflow-y-auto p-1.5 pb-32 sm:grid-cols-2 sm:gap-2 sm:p-2 sm:pb-36">
          {media.map((entry, index) => (
            <CanvasItem
              key={entry.id}
              entry={entry}
              piled={false}
              index={index}
              incoming={entry.id === incomingEntryId}
              onOpen={() => onOpenPhoto(entry)}
            />
          ))}
        </div>
      )}
      {opened ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={opened.kind === 'video' ? 'Video viewer' : 'Photo viewer'}
          onClick={closeFromBackdrop}
          className="fixed inset-0 z-40 flex cursor-zoom-out items-center justify-center border-0 bg-white/95 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-ink sm:p-8"
        >
          {opened.kind === 'video' && opened.video ? (
            <video
              ref={videoRef}
              src={opened.video}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full cursor-default rounded-[8px] bg-black object-contain"
              aria-label={opened.caption ?? `Video from ${opened.author}`}
            />
          ) : opened.image ? (
            <img
              src={opened.image}
              alt={opened.caption ?? opened.author}
              width={1600}
              height={1280}
              className="pointer-events-none max-h-full max-w-full rounded-[8px] object-contain"
            />
          ) : null}
        </div>
      ) : null}
    </main>
  )
}
