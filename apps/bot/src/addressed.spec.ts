import {
  isAddressedToBot,
  isBotCommand,
  shouldIngest,
} from './addressed';
import type { TelegramMessage } from './telegram';

const bot = { id: 9, username: 'digestbot' };

function message(
  overrides: Partial<TelegramMessage> = {},
): TelegramMessage {
  return {
    message_id: 1,
    chat: { id: -100, type: 'supergroup', title: 'Ship' },
    from: { id: 42, username: 'alice' },
    ...overrides,
  };
}

describe('shouldIngest', () => {
  it('keeps a group message that mentions the bot', () => {
    expect(
      shouldIngest(
        message({
          text: 'keep this @digestbot',
          entities: [{ type: 'mention', offset: 10, length: 11 }],
        }),
        bot,
      ),
    ).toBe(true);
  });

  it('drops a group message without a tag or reply to the bot', () => {
    expect(shouldIngest(message({ text: 'noise' }), bot)).toBe(false);
  });

  it('keeps a reply to the bot', () => {
    expect(
      shouldIngest(
        message({
          text: 'this too',
          reply_to_message: message({
            from: { id: 9, is_bot: true, username: 'digestbot' },
          }),
        }),
        bot,
      ),
    ).toBe(true);
  });

  it('keeps a private message and drops /start', () => {
    expect(
      shouldIngest(
        message({
          chat: { id: 42, type: 'private' },
          text: 'from dm',
        }),
        bot,
      ),
    ).toBe(true);
    expect(isBotCommand(message({ text: '/start' }))).toBe(true);
    expect(
      shouldIngest(
        message({
          chat: { id: 42, type: 'private' },
          text: '/start',
          entities: [{ type: 'bot_command', offset: 0, length: 6 }],
        }),
        bot,
      ),
    ).toBe(false);
  });
});

describe('isAddressedToBot', () => {
  it('matches a text_mention of the bot', () => {
    expect(
      isAddressedToBot(
        message({
          text: 'hey bot',
          entities: [
            {
              type: 'text_mention',
              offset: 4,
              length: 3,
              user: { id: 9, username: 'digestbot' },
            },
          ],
        }),
        bot,
      ),
    ).toBe(true);
  });
});
