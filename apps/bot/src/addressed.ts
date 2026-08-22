import type { BotIdentity, TelegramEntity, TelegramMessage } from './telegram';

export function isPrivateChat(type: string): boolean {
  return type === 'private';
}

export function isBotCommand(message: TelegramMessage): boolean {
  const entities = message.entities ?? [];
  if (entities.some((entity) => entity.type === 'bot_command' && entity.offset === 0)) {
    return true;
  }

  return /^\/[A-Za-z0-9_]+/.test(message.text ?? '');
}

export function isAddressedToBot(
  message: TelegramMessage,
  bot: BotIdentity,
): boolean {
  if (message.from?.id === bot.id) {
    return false;
  }

  if (message.reply_to_message?.from?.id === bot.id) {
    return true;
  }

  return (
    mentionsBot(message.text ?? '', message.entities, bot) ||
    mentionsBot(message.caption ?? '', message.caption_entities, bot)
  );
}

export function shouldIngest(
  message: TelegramMessage,
  bot: BotIdentity,
): boolean {
  if (isServiceMessage(message) || !message.from || message.from.id === bot.id) {
    return false;
  }

  if (isPrivateChat(message.chat.type)) {
    return !isBotCommand(message);
  }

  return isAddressedToBot(message, bot);
}

export function messageText(message: TelegramMessage): string | undefined {
  const body = (message.text ?? message.caption ?? '').trim();
  return body.length > 0 ? body : undefined;
}

function mentionsBot(
  text: string,
  entities: TelegramEntity[] | undefined,
  bot: BotIdentity,
): boolean {
  for (const entity of entities ?? []) {
    if (entity.type === 'mention' && bot.username) {
      const slice = text.slice(entity.offset, entity.offset + entity.length);
      if (slice.toLowerCase() === `@${bot.username}`.toLowerCase()) {
        return true;
      }
    }

    if (entity.type === 'text_mention' && entity.user?.id === bot.id) {
      return true;
    }
  }

  return false;
}

function isServiceMessage(message: TelegramMessage): boolean {
  return Boolean(message.new_chat_members || message.left_chat_member);
}
