import { Play } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";

import { mediaEntries } from "../lib/playlist";
import type { DayEntry } from "../types/canvas";

export type CanvasLayout = "pile" | "grid";

type CanvasBoardProps = {
  entries: DayEntry[];
  layout: CanvasLayout;
  opened: DayEntry | null;
  onExpandPile: () => void;
  onOpenPhoto: (entry: DayEntry) => void;
  onClosePhoto: () => void;
};

const fallbackPalettes = [
  ["#e8c8a5", "#9f6147", "#f3e5c8"],
  ["#bed8cf", "#44786a", "#f0c77b"],
  ["#d8c6ae", "#6a7d92", "#f4d4c3"],
  ["#c9d8e8", "#4f6d8a", "#e9bd9b"],
] as const;

function paletteFor(id: string): CSSProperties {
  const hash = [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const [one, two, three] =
    fallbackPalettes[hash % fallbackPalettes.length] ?? fallbackPalettes[0];
  return { "--art-one": one, "--art-two": two, "--art-three": three } as CSSProperties;
}

function MediaArtwork({
  entry,
  eager = false,
  expanded = false,
}: {
  entry: DayEntry;
  eager?: boolean;
  expanded?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const label = entry.caption ?? `Memory from ${entry.author}`;

  return (
    <figure
      className={`media-surface relative m-0 overflow-hidden rounded-[10px] ${
        expanded ? "max-h-full max-w-full bg-white/50" : "bg-white/30"
      }`}
    >
      {entry.image && !imageFailed ? (
        <img
          src={entry.image}
          alt={label}
          width={expanded ? 1600 : 1200}
          height={expanded ? 1280 : 960}
          loading={eager ? "eager" : "lazy"}
          onError={() => setImageFailed(true)}
          className={
            expanded
              ? "block max-h-[calc(100dvh-8rem)] max-w-[calc(100vw-2rem)] object-contain sm:max-w-[calc(100vw-4rem)]"
              : "block aspect-[5/4] w-full object-cover"
          }
        />
      ) : (
        <div
          role="img"
          aria-label={label}
          className={`fallback-art ${expanded ? "h-[min(72dvh,760px)] w-[min(88vw,950px)]" : "aspect-[5/4] w-full"}`}
          style={paletteFor(entry.id)}
        >
          <span>{label}</span>
        </div>
      )}
      {entry.kind === "video" ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="glass flex size-14 items-center justify-center rounded-full text-ink">
            <Play aria-hidden="true" size={16} />
          </span>
        </span>
      ) : null}
    </figure>
  );
}

function CanvasItem({
  entry,
  piled,
  index,
  onOpen,
}: {
  entry: DayEntry;
  piled: boolean;
  index: number;
  onOpen?: () => void;
}) {
  if (piled) {
    return (
      <div
        className="absolute inset-0 w-full"
        style={{
          zIndex: index + 1,
          transform: `rotate(${-8 + index * 4}deg) translateY(${index * -2}px)`,
        }}
      >
        <MediaArtwork entry={entry} eager />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="gallery-item w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      style={{ animationDelay: `${index * 45}ms` }}
      aria-label={`Open ${entry.kind === "video" ? "video" : "photo"} from ${entry.author}`}
    >
      <MediaArtwork entry={entry} />
    </button>
  );
}

export function CanvasBoard({
  entries,
  layout,
  opened,
  onExpandPile,
  onOpenPhoto,
  onClosePhoto,
}: CanvasBoardProps) {
  const media = useMemo(() => mediaEntries(entries), [entries]);

  return (
    <main
      id="family-canvas"
      tabIndex={-1}
      className="relative h-full min-h-0 w-full overflow-hidden overscroll-contain"
    >
      {layout === "pile" ? (
        <button
          type="button"
          onClick={onExpandPile}
          className="photo-pile absolute top-[38%] left-1/2 aspect-[5/4] w-[min(520px,78vw)] -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          aria-label="Open photo gallery"
        >
          {media.map((entry, index) => (
            <CanvasItem key={entry.id} entry={entry} piled index={index} />
          ))}
        </button>
      ) : (
        <div className="absolute inset-0 grid h-full w-full grid-cols-1 gap-1.5 overflow-y-auto p-1.5 pb-32 sm:grid-cols-2 sm:gap-2 sm:p-2 sm:pb-36 lg:grid-cols-3">
          {media.map((entry, index) => (
            <CanvasItem
              key={entry.id}
              entry={entry}
              piled={false}
              index={index}
              onOpen={() => onOpenPhoto(entry)}
            />
          ))}
        </div>
      )}

      {opened ? (
        <button
          type="button"
          onClick={onClosePhoto}
          className="fixed inset-0 z-40 flex cursor-zoom-out items-center justify-center border-0 bg-slate-50/95 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-ink sm:p-8"
          aria-label="Close photo"
        >
          <MediaArtwork entry={opened} eager expanded />
        </button>
      ) : null}
    </main>
  );
}
