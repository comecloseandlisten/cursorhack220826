export type TelegramUser = {
  id: number;
  is_bot?: boolean;
  username?: string;
};

export type TelegramChat = {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel' | string;
  title?: string;
  username?: string;
};

export type TelegramEntity = {
  type: string;
  offset: number;
  length: number;
  user?: TelegramUser;
};

export type TelegramPhotoSize = {
  file_id: string;
  file_size?: number;
  width: number;
  height: number;
};

export type TelegramFilePart = {
  file_id: string;
  mime_type?: string;
  file_name?: string;
  file_size?: number;
};

export type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
  caption?: string;
  entities?: TelegramEntity[];
  caption_entities?: TelegramEntity[];
  reply_to_message?: TelegramMessage;
  photo?: TelegramPhotoSize[];
  animation?: TelegramFilePart;
  video?: TelegramFilePart;
  video_note?: TelegramFilePart;
  audio?: TelegramFilePart;
  voice?: TelegramFilePart;
  document?: TelegramFilePart;
  sticker?: { file_id: string };
  media_group_id?: string;
  new_chat_members?: TelegramUser[];
  left_chat_member?: TelegramUser;
};

export type TelegramReactionType =
  | { type: 'emoji'; emoji: string }
  | { type: 'custom_emoji'; custom_emoji_id: string }
  | { type: string };

export type BotIdentity = {
  id: number;
  username?: string;
};
