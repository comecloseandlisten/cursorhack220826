import type { ChronicleDay, DayEntry, EntryKind } from "../types/canvas";
import type { MessageMedia, MessageView } from "../types/messages";

function entryKind(media?: MessageMedia): EntryKind {
  if (!media) return "note";
  if (media.mime === "audio/mpeg") return "voice";
  if (media.mime === "video/mp4") return "video";
  return "photo";
}

function displayEntries(
  message: MessageView,
  senderNames: Record<string, string>,
): DayEntry[] {
  const author = senderNames[message.senderId] ?? message.senderId;
  const time = message.dateTimeSend.slice(11, 16);
  const source = message.channel === "chat" ? "chat" : "direct";
  const body = message.text?.body;
  const media = message.media.length ? message.media : [undefined];

  return media.map((item, index) => {
    const kind = entryKind(item);
    const id = index === 0 ? message.id : `${message.id}-${index + 1}`;
    const phrase = kind === "note" || kind === "voice" ? { body } : { caption: body };
    const image = item?.mime.startsWith("image/") ? item.url : undefined;

    return { id, kind, author, time, source, image, ...phrase };
  });
}

export function adaptMessagesToDays(
  messages: MessageView[],
  senderNames: Record<string, string>,
): ChronicleDay[] {
  const byDay = new Map<string, DayEntry[]>();

  for (const message of messages) {
    const day = message.dateTimeSend.slice(0, 10);
    const entries = byDay.get(day) ?? [];
    entries.push(...displayEntries(message, senderNames));
    byDay.set(day, entries);
  }

  return [...byDay]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, entries]) => ({
      date,
      entries: entries.sort((left, right) => left.time.localeCompare(right.time)),
    }));
}
