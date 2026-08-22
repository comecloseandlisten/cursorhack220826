import type { TelegramMessage } from './telegram';

export class AlbumBuffer {
  private readonly groups = new Map<
    string,
    { messages: TelegramMessage[]; timer: ReturnType<typeof setTimeout> }
  >();

  constructor(
    private readonly waitMs: number,
    private readonly flush: (messages: TelegramMessage[]) => void,
  ) {}

  push(message: TelegramMessage): void {
    const groupId = message.media_group_id;

    if (!groupId) {
      this.flush([message]);
      return;
    }

    const key = `${message.chat.id}:${groupId}`;
    const existing = this.groups.get(key);

    if (existing) {
      clearTimeout(existing.timer);
      existing.messages.push(message);
      existing.timer = setTimeout(() => this.release(key), this.waitMs);
      return;
    }

    this.groups.set(key, {
      messages: [message],
      timer: setTimeout(() => this.release(key), this.waitMs),
    });
  }

  clear(): void {
    for (const group of this.groups.values()) {
      clearTimeout(group.timer);
    }
    this.groups.clear();
  }

  private release(key: string): void {
    const group = this.groups.get(key);
    if (!group) {
      return;
    }

    this.groups.delete(key);
    this.flush(group.messages);
  }
}
