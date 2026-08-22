export const ALLOWED_MIMES = [
  'video/mp4',
  'audio/mpeg',
  'image/jpeg',
  'image/png',
  'image/gif',
] as const;

export type AllowedMime = (typeof ALLOWED_MIMES)[number];

export type DigestMedia = {
  mime: AllowedMime;
  url: string;
};

export type DigestMessage = {
  id: string;
  parentMessageId: string | null;
};

export type ChatIngest = {
  chatId: string;
  chatTitle?: string;
  sourceMessageId: string;
  authorId: string;
  taggedById: string;
  canvasId: string;
  text?: { body: string };
  media?: DigestMedia[];
  sourceUrl?: string;
  parentMessageId?: string;
};

export type DmIngest = {
  authorId: string;
  sourceMessageId: string;
  canvasId: string;
  text?: { body: string };
  media?: DigestMedia[];
  parentMessageId?: string;
};

export class DigestApi {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  async uploadMedia(
    bytes: Buffer,
    filename: string,
    mime: AllowedMime,
  ): Promise<DigestMedia> {
    const body = new FormData();
    body.append(
      'file',
        new Blob([new Uint8Array(bytes)], { type: mime }),
      filename,
    );

    return this.request<DigestMedia>('/media', {
      method: 'POST',
      body,
    });
  }

  async ingestChat(payload: ChatIngest): Promise<DigestMessage> {
    return this.request<DigestMessage>('/ingest/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async ingestDm(payload: DmIngest): Promise<DigestMessage> {
    return this.request<DigestMessage>('/ingest/dm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  /** sourceId: chatId группового чата или authorId лички (см. openapi). */
  async getSource(
    sourceId: string,
    sourceMessageId: string,
  ): Promise<DigestMessage | undefined> {
    const query = new URLSearchParams({ sourceId, sourceMessageId });
    const response = await fetch(`${this.baseUrl}/ingest/source?${query}`, {
      headers: { authorization: `Bearer ${this.token}` },
    });

    if (response.status === 404) {
      return undefined;
    }

    return this.readJson<DigestMessage>(response);
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${this.token}`);

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    return this.readJson<T>(response);
  }

  private async readJson<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Digest API ${response.status}: ${body}`);
    }

    return (await response.json()) as T;
  }
}
