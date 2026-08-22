import { HttpStatus } from '@nestjs/common';
import { ApiError } from '../http/api-error';
import { MEDIA_MIMES, type MediaMime, type ParsedMessageContent } from './message.types';

const FORBIDDEN_CREATE_FIELDS = ['id', 'dateTimeSend', 'senderId', 'channel'] as const;

const DEFAULT_CHILD_OFFSET = { x: 40, y: 96 };

export function parseMessageCreate(body: unknown): ParsedMessageContent {
  const record = asRecord(body, 'Некорректное тело запроса.');
  assertNoServerFields(record);
  return parseMessageContent(record);
}

export function parseChatIngest(body: unknown): ParsedMessageContent & {
  authorId: string;
  taggedById: string;
  chatId: string;
  chatTitle?: string;
  sourceMessageId: string;
  sourceUrl?: string;
} {
  const record = asRecord(body, 'Некорректное тело запроса.');
  const content = parseMessageContent(record);
  const chatId = requiredString(record.chatId, 'chat_id_required', 'Нужен chatId.');
  const sourceMessageId = requiredString(
    record.sourceMessageId,
    'source_required',
    'Нужен sourceMessageId.',
  );
  const authorId = requiredString(record.authorId, 'author_required', 'Нужен authorId.');
  const taggedById = requiredString(
    record.taggedById,
    'tagged_by_required',
    'Нужен taggedById.',
  );

  return {
    ...content,
    authorId,
    taggedById,
    chatId,
    chatTitle: optionalString(record.chatTitle),
    sourceMessageId,
    sourceUrl: optionalString(record.sourceUrl),
  };
}

export function parseDmIngest(body: unknown): ParsedMessageContent & {
  authorId: string;
  sourceMessageId: string;
} {
  const record = asRecord(body, 'Некорректное тело запроса.');
  const content = parseMessageContent(record);
  const authorId = requiredString(record.authorId, 'author_required', 'Нужен authorId.');
  const sourceMessageId = requiredString(
    record.sourceMessageId,
    'source_required',
    'Нужен sourceMessageId.',
  );

  return { ...content, authorId, sourceMessageId };
}

export function chatDedupKey(chatId: string, sourceMessageId: string): string {
  return `chat:${chatId}:${sourceMessageId}`;
}

export function dmDedupKey(authorId: string, sourceMessageId: string): string {
  return `dm:${authorId}:${sourceMessageId}`;
}

export function optionalQuery(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function queryDate(
  value: string | undefined,
  field: string,
): Date | undefined {
  const raw = optionalQuery(value);
  if (!raw) {
    return undefined;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'bad_date',
      `Некорректная дата: ${field}.`,
    );
  }

  return date;
}

export function defaultChildPosition(parent?: { x: number; y: number }): {
  x: number;
  y: number;
} {
  if (!parent) {
    return { x: 80, y: 80 };
  }

  return {
    x: parent.x + DEFAULT_CHILD_OFFSET.x,
    y: parent.y + DEFAULT_CHILD_OFFSET.y,
  };
}

function parseMessageContent(record: Record<string, unknown>): ParsedMessageContent {
  const canvasId = requiredString(
    record.canvasId,
    'canvas_required',
    'Нужен canvasId.',
  );
  const text = parseText(record.text);
  const media = parseMedia(record.media);

  if (!text && media.length === 0) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'empty_body',
      'Нужен текст или хотя бы одно вложение.',
    );
  }

  return {
    canvasId,
    text,
    media,
    revealAnimation: optionalString(record.revealAnimation),
    dateTimeReveal: parseOptionalDate(record.dateTimeReveal),
    parentMessageId: optionalString(record.parentMessageId),
    canvasPosition: parsePosition(record.canvasPosition),
    canvasPositionManual: record.canvasPosition !== undefined,
    tag: optionalString(record.tag),
  };
}

function parseText(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  const record = asRecord(value, 'text должен быть объектом.');
  const body = typeof record.body === 'string' ? record.body.trim() : '';

  if (body.length === 0) {
    return undefined;
  }

  const fontType = optionalString(record.fontType);
  const design = optionalString(record.design);
  const size = parseOptionalNumber(record.size, 'text.size');

  return {
    body,
    ...(fontType ? { fontType } : {}),
    ...(design ? { design } : {}),
    ...(size !== undefined ? { size } : {}),
  };
}

function parseMedia(value: unknown): ParsedMessageContent['media'] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_media', 'media должен быть массивом.');
  }

  return value.map((item, index) => parseMediaItem(item, index));
}

function parseMediaItem(value: unknown, index: number) {
  const record = asRecord(value, `media[${index}] должен быть объектом.`);
  const mime = record.mime;
  const url = record.url;

  if (typeof mime !== 'string' || !isMediaMime(mime)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_mime', 'Недопустимый mime.');
  }

  if (typeof url !== 'string' || url.trim() === '') {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_media', 'У вложения нужен url.');
  }

  return { mime, url: url.trim() };
}

function parsePosition(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  const record = asRecord(value, 'canvasPosition должен быть объектом.');
  const x = parseOptionalNumber(record.x, 'canvasPosition.x');
  const y = parseOptionalNumber(record.y, 'canvasPosition.y');

  if (x === undefined || y === undefined) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'bad_position',
      'canvasPosition нуждается в x и y.',
    );
  }

  return { x, y };
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_date', 'Некорректная дата.');
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_date', 'Некорректная дата.');
  }

  return date;
}

function parseOptionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_number', `Некорректное число: ${field}.`);
  }

  return value;
}

function assertNoServerFields(record: Record<string, unknown>): void {
  for (const field of FORBIDDEN_CREATE_FIELDS) {
    if (field in record) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'server_field',
        `Поле ${field} ставит сервер.`,
      );
    }
  }
}

function asRecord(value: unknown, message: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_request', message);
  }

  return value as Record<string, unknown>;
}

function requiredString(value: unknown, code: string, message: string): string {
  const parsed = optionalString(value);
  if (!parsed) {
    throw new ApiError(HttpStatus.BAD_REQUEST, code, message);
  }

  return parsed;
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'bad_string', 'Ожидалась строка.');
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isMediaMime(value: string): value is MediaMime {
  return (MEDIA_MIMES as readonly string[]).includes(value);
}
