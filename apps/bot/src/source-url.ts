import type { TelegramChat } from './telegram';

export function telegramMessageUrl(
  chat: TelegramChat,
  messageId: number,
): string | undefined {
  if (chat.username) {
    return `https://t.me/${chat.username}/${messageId}`;
  }

  const chatId = String(chat.id);
  if (chatId.startsWith('-100')) {
    return `https://t.me/c/${chatId.slice(4)}/${messageId}`;
  }

  return undefined;
}

export function telegramUserId(userId: number): string {
  return `tg:${userId}`;
}
