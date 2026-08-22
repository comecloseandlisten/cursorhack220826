import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { CanvasesService } from '../canvases/canvases.service';
import { ApiError } from '../http/api-error';
import { newId } from '../ids';
import { selectDigestMessages } from './digest-filter';
import {
  chatDedupKey,
  defaultChildPosition,
  dmDedupKey,
  optionalQuery,
  parseChatIngest,
  parseDmIngest,
  parseMessageCreate,
  queryDate,
} from './message-body';
import { Message } from './message.schema';
import type { Channel, MessageView, ParsedMessageContent } from './message.types';
import { toMessageView } from './message-view';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly canvasesService: CanvasesService,
  ) {}

  async list(
    viewerId: string,
    query: {
      canvasId?: string;
      dateFrom?: string;
      dateTo?: string;
      text?: string;
      imageObject?: string;
    },
  ): Promise<{ items: MessageView[] }> {
    const canvasId = optionalQuery(query.canvasId);
    if (!canvasId) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'canvas_required',
        'Нужен canvasId.',
      );
    }

    await this.canvasesService.assertExists(canvasId);

    const docs = await this.messageModel
      .find({ canvasId })
      .sort({ dateTimeSend: -1 })
      .lean()
      .exec();

    const now = new Date();
    const items = selectDigestMessages(docs, {
      dateFrom: queryDate(query.dateFrom, 'dateFrom'),
      dateTo: queryDate(query.dateTo, 'dateTo'),
      text: optionalQuery(query.text),
      imageObject: optionalQuery(query.imageObject),
    });

    return {
      items: items.map((message) => toMessageView(message, viewerId, now)),
    };
  }

  async get(viewerId: string, messageId: string): Promise<MessageView> {
    const doc = await this.messageModel.findById(messageId).lean().exec();
    if (!doc) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'message_not_found',
        'Сообщение не найдено.',
      );
    }

    return toMessageView(doc, viewerId, new Date());
  }

  async createWeb(senderId: string, body: unknown): Promise<MessageView> {
    const parsed = parseMessageCreate(body);
    const created = await this.insert(parsed, senderId, 'web');
    return toMessageView(created, senderId, new Date());
  }

  async ingestChat(
    body: unknown,
  ): Promise<{ created: boolean; message: MessageView }> {
    const parsed = parseChatIngest(body);
    const dedupKey = chatDedupKey(parsed.chatId, parsed.sourceMessageId);
    const existing = await this.messageModel
      .findOne({ 'source.dedupKey': dedupKey })
      .lean()
      .exec();

    if (existing) {
      return {
        created: false,
        message: toMessageView(existing, parsed.authorId, new Date()),
      };
    }

    try {
      const created = await this.insert(parsed, parsed.authorId, 'chat', {
        dedupKey,
        chatId: parsed.chatId,
        chatTitle: parsed.chatTitle,
        sourceMessageId: parsed.sourceMessageId,
        taggedById: parsed.taggedById,
        sourceUrl: parsed.sourceUrl,
      });

      return {
        created: true,
        message: toMessageView(created, parsed.authorId, new Date()),
      };
    } catch (error) {
      return this.existingOrThrow(error, dedupKey, parsed.authorId);
    }
  }

  async ingestDm(
    body: unknown,
  ): Promise<{ created: boolean; message: MessageView }> {
    const parsed = parseDmIngest(body);
    const dedupKey = dmDedupKey(parsed.authorId, parsed.sourceMessageId);
    const existing = await this.messageModel
      .findOne({ 'source.dedupKey': dedupKey })
      .lean()
      .exec();

    if (existing) {
      return {
        created: false,
        message: toMessageView(existing, parsed.authorId, new Date()),
      };
    }

    try {
      const created = await this.insert(parsed, parsed.authorId, 'dm', {
        dedupKey,
        sourceMessageId: parsed.sourceMessageId,
      });

      return {
        created: true,
        message: toMessageView(created, parsed.authorId, new Date()),
      };
    } catch (error) {
      return this.existingOrThrow(error, dedupKey, parsed.authorId);
    }
  }

  private async insert(
    parsed: ParsedMessageContent,
    senderId: string,
    channel: Channel,
    source?: Message['source'],
  ): Promise<Message> {
    await this.canvasesService.assertExists(parsed.canvasId);
    const parent = await this.resolveParent(parsed);
    const dateTimeSend = new Date();

    if (parsed.dateTimeReveal && parsed.dateTimeReveal < dateTimeSend) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'reveal_in_past',
        'dateTimeReveal не может быть раньше отправки.',
      );
    }

    const canvasPosition =
      parsed.canvasPosition ?? defaultChildPosition(parent?.canvasPosition);

    return this.messageModel.create({
      _id: newId('msg'),
      ...(parsed.text ? { text: parsed.text } : {}),
      ...(parsed.revealAnimation
        ? { revealAnimation: parsed.revealAnimation }
        : {}),
      media: parsed.media,
      dateTimeSend,
      canvasId: parsed.canvasId,
      ...(parsed.dateTimeReveal ? { dateTimeReveal: parsed.dateTimeReveal } : {}),
      senderId,
      parentMessageId: parsed.parentMessageId ?? null,
      canvasPosition,
      canvasPositionManual: parsed.canvasPositionManual,
      tag: parsed.tag ?? null,
      channel,
      imageObjects: [],
      ...(source ? { source } : {}),
    });
  }

  private async existingOrThrow(
    error: unknown,
    dedupKey: string,
    viewerId: string,
  ): Promise<{ created: boolean; message: MessageView }> {
    if (!isDuplicateKey(error)) {
      throw error;
    }

    const existing = await this.messageModel
      .findOne({ 'source.dedupKey': dedupKey })
      .lean()
      .exec();

    if (!existing) {
      throw error;
    }

    return {
      created: false,
      message: toMessageView(existing, viewerId, new Date()),
    };
  }

  private async resolveParent(
    parsed: ParsedMessageContent,
  ): Promise<Message | null> {
    if (!parsed.parentMessageId) {
      return null;
    }

    const parent = await this.messageModel
      .findById(parsed.parentMessageId)
      .lean()
      .exec();

    if (!parent || parent.canvasId !== parsed.canvasId) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        'parent_not_found',
        'Родитель не найден на этом канвасе.',
      );
    }

    return parent;
  }
}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}
