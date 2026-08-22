import { Play } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";

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

function showPreviewFrame(video: HTMLVideoElement) {
  if (video.currentTime > 0) return;
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = Math.min(0.1, video.duration / 4);
}

function MediaArtwork({
  entry,
  eager = false,
}: {
  entry: DayEntry;
  eager?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const label = entry.caption ?? `Memory from ${entry.author}`;

  return (
    <figure className="media-surface relative m-0 overflow-hidden rounded-[10px] bg-white/30">
      {entry.kind === "video" && entry.video ? (
        <video
          src={`${entry.video}#t=0.1`}
          muted
          playsInline
          preload={eager ? "auto" : "metadata"}
          onLoadedMetadata={(event) => showPreviewFrame(event.currentTarget)}
          className="pointer-events-none block aspect-[5/4] w-full object-cover"
          aria-label={label}
        />
      ) : entry.image && !imageFailed ? (
        <img
          src={entry.image}
          alt={label}
          width={1200}
          height={960}
          loading={eager ? "eager" : "lazy"}
          onError={() => setImageFailed(true)}
          className="block aspect-[5/4] w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={label}
          className="fallback-art aspect-[5/4] w-full"
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [opened?.id]);

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClosePhoto();
    }
  }

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
        <div
          role="dialog"
          aria-modal="true"
          aria-label={opened.kind === "video" ? "Video viewer" : "Photo viewer"}
          onClick={closeFromBackdrop}
          className="fixed inset-0 z-40 flex cursor-zoom-out items-center justify-center border-0 bg-slate-50/95 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-ink sm:p-8"
        >
          {opened.kind === "video" && opened.video ? (
            <video
              ref={videoRef}
              src={opened.video}
              controls
              autoPlay
              playsInline
              className="max-h-[calc(100dvh-8rem)] max-w-[calc(100vw-2rem)] cursor-default rounded-[10px] bg-black object-contain sm:max-w-[calc(100vw-4rem)]"
              aria-label={opened.caption ?? `Video from ${opened.author}`}
            />
          ) : opened.image ? (
            <img
              src={opened.image}
              alt={opened.caption ?? `Memory from ${opened.author}`}
              width={1600}
              height={1280}
              className="pointer-events-none max-h-[calc(100dvh-8rem)] max-w-[calc(100vw-2rem)] rounded-[10px] object-contain sm:max-w-[calc(100vw-4rem)]"
            />
          ) : (
            <div className="pointer-events-none">
              <MediaArtwork entry={opened} eager />
            </div>
          )}
        </div>
      ) : null}
    </main>
  );
}
