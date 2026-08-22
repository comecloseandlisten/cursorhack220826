import { telegramMessageUrl, telegramUserId } from './source-url';

describe('telegramMessageUrl', () => {
  it('uses the public username when present', () => {
    expect(
      telegramMessageUrl({ id: -1001, type: 'supergroup', username: 'ship' }, 15),
    ).toBe('https://t.me/ship/15');
  });

  it('uses t.me/c for private supergroups', () => {
    expect(
      telegramMessageUrl({ id: -1001234567890, type: 'supergroup' }, 8),
    ).toBe('https://t.me/c/1234567890/8');
  });
});

describe('telegramUserId', () => {
  it('prefixes telegram ids for senderId', () => {
    expect(telegramUserId(42)).toBe('tg:42');
  });
});
