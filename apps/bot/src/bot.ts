import { Bot, type Api } from 'grammy';
import { AlbumBuffer } from './album';
import {
  isBotCommand,
  isPrivateChat,
  messageText,
  shouldIngest,
} from './addressed';
import type { BotConfig } from './config';
import { resolveCanvasId } from './config';
import {
  DigestApi,
  type AllowedMime,
  type DigestMedia,
} from './digest-api';
import { collectTelegramFiles } from './media';
import { telegramMessageUrl, telegramUserId } from './source-url';
import type { BotIdentity, TelegramMessage } from './telegram';

const TELEGRAM_FILE_PREFIX = 'https://api.telegram.org/file/bot';

export function createBot(config: BotConfig, digest: DigestApi): Bot {
  const bot = new Bot(config.telegramBotToken);
  const albums = new AlbumBuffer(700, (messages) => {
    void ingestMessages(messages, bot, digest, config).catch((error: unknown) => {
      console.error('Failed to ingest album', error);
    });
  });

  bot.command('start', async (ctx) => {
    await ctx.reply(
      'Кидай текст или картинку — сохраню в digest. В группе тегни меня в сообщении, которое нужно собрать. Команды в digest не кладу.',
    );
  });

  bot.on('message', async (ctx) => {
    const message = ctx.message as TelegramMessage;
    albums.push(message);
  });

  bot.catch((error) => {
    console.error('Telegram bot error', error);
  });

  return bot;
}

export async function ingestMessages(
  messages: TelegramMessage[],
  bot: { api: Api; botInfo?: BotIdentity },
  digest: DigestApi,
  config: BotConfig,
): Promise<void> {
  const identity = requireIdentity(bot);
  const addressed = messages.filter((message) => shouldIngest(message, identity));

  if (addressed.length === 0) {
    return;
  }

  const first = addressed[0];
  if (!first?.from) {
    return;
  }

  const text = uniqueText(addressed);
  const media = await downloadMedia(messages, bot.api, digest, config.telegramBotToken);

  if (!text && media.length === 0) {
    if (isPrivateChat(first.chat.type) && !isBotCommand(first)) {
      await bot.api.sendMessage(
        first.chat.id,
        'Пустое тело: нужен текст и/или jpeg/png/gif/mp4/mp3.',
      );
    }
    return;
  }

  const parentMessageId = await resolveParent(first, digest);
  const canvasId = resolveCanvasId(
    String(first.chat.id),
    config.chatCanvasMap,
    config.defaultCanvasId,
  );
  const sourceMessageId = first.media_group_id
    ? first.media_group_id
    : String(first.message_id);

  if (isPrivateChat(first.chat.type)) {
    await digest.ingestDm({
      authorId: telegramUserId(first.from.id),
      sourceMessageId,
      canvasId,
      ...(text ? { text: { body: text } } : {}),
      ...(media.length > 0 ? { media } : {}),
      ...(parentMessageId ? { parentMessageId } : {}),
    });
    await bot.api.sendMessage(first.chat.id, 'Сохранил в digest.', {
      reply_to_message_id: first.message_id,
    });
    return;
  }

  const sourceUrl = telegramMessageUrl(first.chat, first.message_id);
  await digest.ingestChat({
    chatId: String(first.chat.id),
    ...(first.chat.title ? { chatTitle: first.chat.title } : {}),
    sourceMessageId,
    authorId: telegramUserId(first.from.id),
    taggedById: telegramUserId(first.from.id),
    canvasId,
    ...(text ? { text: { body: text } } : {}),
    ...(media.length > 0 ? { media } : {}),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(parentMessageId ? { parentMessageId } : {}),
  });
}

async function resolveParent(
  message: TelegramMessage,
  digest: DigestApi,
): Promise<string | undefined> {
  const reply = message.reply_to_message;
  if (!reply || reply.from?.id === undefined) {
    return undefined;
  }

  // В личке дедуп-ключ dm:authorId:…, в группе — chat:chatId:… (см. openapi).
  const sourceId = isPrivateChat(message.chat.type)
    ? telegramUserId(message.from?.id ?? message.chat.id)
    : String(message.chat.id);

  const parent = await digest.getSource(sourceId, String(reply.message_id));
  return parent?.id;
}

async function downloadMedia(
  messages: TelegramMessage[],
  api: Api,
  digest: DigestApi,
  token: string,
): Promise<DigestMedia[]> {
  const uploaded: DigestMedia[] = [];

  for (const message of messages) {
    for (const file of collectTelegramFiles(message)) {
      const bytes = await downloadTelegramFile(api, token, file.fileId);
      if (!bytes) {
        continue;
      }

      uploaded.push(
        await digest.uploadMedia(bytes, file.filename, file.mime as AllowedMime),
      );
    }
  }

  return uploaded;
}

async function downloadTelegramFile(
  api: Api,
  token: string,
  fileId: string,
): Promise<Buffer | undefined> {
  const file = await api.getFile(fileId);
  if (!file.file_path) {
    return undefined;
  }

  const response = await fetch(
    `${TELEGRAM_FILE_PREFIX}${token}/${file.file_path}`,
  );

  if (!response.ok) {
    throw new Error(`Telegram file download failed: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function uniqueText(messages: TelegramMessage[]): string | undefined {
  const parts = [
    ...new Set(
      messages
        .map((message) => messageText(message))
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  return parts.length > 0 ? parts.join('\n') : undefined;
}

function requireIdentity(bot: { botInfo?: BotIdentity }): BotIdentity {
  if (!bot.botInfo) {
    throw new Error('Bot identity is not initialized');
  }

  return bot.botInfo;
}
