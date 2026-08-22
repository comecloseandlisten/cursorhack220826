export type MediaMime =
  | "video/mp4"
  | "audio/mpeg"
  | "image/jpeg"
  | "image/png"
  | "image/gif";

export type MessageChannel = "web" | "chat" | "dm";

export type MessageText = {
  body: string;
  fontType?: string;
  design?: string;
  size?: number;
};

export type MessageMedia = {
  mime: MediaMime;
  url: string;
};

export type CanvasPosition = {
  x: number;
  y: number;
};

export type MessageView = {
  id: string;
  text?: MessageText;
  revealAnimation: string | null;
  media: MessageMedia[];
  dateTimeSend: string;
  canvasId: string;
  dateTimeReveal: string | null;
  senderId: string;
  parentMessageId: string | null;
  canvasPosition?: CanvasPosition;
  tag: string | null;
  channel: MessageChannel;
};
