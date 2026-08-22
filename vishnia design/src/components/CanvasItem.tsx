import { Play } from 'lucide-react'
import { useState } from 'react'

import type { DayEntry } from '../types'

type CanvasItemProps = {
  entry: DayEntry
  piled: boolean
  index: number
  onOpen?: () => void
}

export function CanvasItem({
  entry,
  piled,
  index,
  onOpen,
}: CanvasItemProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const content = (
    <>
      <figure className="media-surface relative overflow-hidden rounded-[8px] bg-white/30">
        {entry.image && !imageFailed ? (
          <img
            src={entry.image}
            alt={entry.caption ?? entry.author}
            width={1200}
            height={960}
            loading={piled ? 'eager' : 'lazy'}
            onError={() => setImageFailed(true)}
            className="block aspect-[5/4] w-full object-cover"
          />
        ) : (
          <div className="aspect-[5/4] w-full bg-white/30" />
        )}
        {entry.kind === 'video' ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="glass flex size-14 items-center justify-center rounded-full text-ink">
              <Play aria-hidden="true" size={16} />
            </span>
          </span>
        ) : null}
      </figure>
    </>
  )

  if (piled) {
    return (
      <div
        className="absolute inset-0 w-full"
        style={{
          zIndex: index + 1,
          transform: `rotate(${-8 + index * 4}deg)`,
        }}
      >
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="gallery-item w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      style={{ animationDelay: `${index * 45}ms` }}
      aria-label={`Open ${entry.kind === 'video' ? 'video' : 'photo'} from ${entry.author}`}
    >
      {content}
    </button>
  )
}
