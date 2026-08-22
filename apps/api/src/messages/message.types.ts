export const MEDIA_MIMES = [
  'video/mp4',
  'audio/mpeg',
  'image/jpeg',
  'image/png',
  'image/gif',
] as const;

export type MediaMime = (typeof MEDIA_MIMES)[number];

export const IMAGE_MIMES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
]);

export type Channel = 'web' | 'chat' | 'dm';

export type ParsedText = {
  body: string;
  fontType?: string;
  design?: string;
  size?: number;
};

export type ParsedMedia = {
  mime: MediaMime;
  url: string;
};

export type ParsedPosition = {
  x: number;
  y: number;
};

export type ParsedMessageContent = {
  canvasId: string;
  text?: ParsedText;
  media: ParsedMedia[];
  revealAnimation?: string;
  dateTimeReveal?: Date;
  parentMessageId?: string;
  canvasPosition?: ParsedPosition;
  canvasPositionManual: boolean;
  tag?: string;
};

export type MessageView = {
  id: string;
  text?: ParsedText;
  revealAnimation: string | null;
  media: ParsedMedia[];
  dateTimeSend: string;
  canvasId: string;
  dateTimeReveal: string | null;
  senderId: string;
  parentMessageId: string | null;
  canvasPosition?: ParsedPosition;
  tag: string | null;
  channel: Channel;
};
