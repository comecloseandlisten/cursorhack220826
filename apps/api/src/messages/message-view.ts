import type { Message } from './message.schema';
import type { MessageView } from './message.types';

type MessageRecord = Pick<
  Message,
  | '_id'
  | 'text'
  | 'revealAnimation'
  | 'media'
  | 'dateTimeSend'
  | 'canvasId'
  | 'dateTimeReveal'
  | 'senderId'
  | 'parentMessageId'
  | 'canvasPosition'
  | 'tag'
  | 'channel'
>;

export function toMessageView(
  message: MessageRecord,
  viewerId: string,
  now: Date,
): MessageView {
  const view: MessageView = {
    id: message._id,
    text: message.text
      ? {
          body: message.text.body,
          ...(message.text.fontType ? { fontType: message.text.fontType } : {}),
          ...(message.text.design ? { design: message.text.design } : {}),
          ...(message.text.size !== undefined ? { size: message.text.size } : {}),
        }
      : undefined,
    revealAnimation: message.revealAnimation ?? null,
    media: (message.media ?? []).map((item) => ({
      mime: item.mime,
      url: item.url,
    })),
    dateTimeSend: message.dateTimeSend.toISOString(),
    canvasId: message.canvasId,
    dateTimeReveal: message.dateTimeReveal
      ? message.dateTimeReveal.toISOString()
      : null,
    senderId: message.senderId,
    parentMessageId: message.parentMessageId ?? null,
    canvasPosition: message.canvasPosition
      ? { x: message.canvasPosition.x, y: message.canvasPosition.y }
      : undefined,
    tag: message.tag ?? null,
    channel: message.channel,
  };

  if (shouldMask(message, viewerId, now)) {
    delete view.text;
    view.media = [];
  }

  return view;
}

export function shouldMask(
  message: Pick<MessageRecord, 'dateTimeReveal' | 'senderId'>,
  viewerId: string,
  now: Date,
): boolean {
  if (!message.dateTimeReveal) {
    return false;
  }

  if (message.senderId === viewerId) {
    return false;
  }

  return message.dateTimeReveal > now;
}
