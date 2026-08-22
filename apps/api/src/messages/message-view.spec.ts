import { toMessageView } from './message-view';
import type { Message } from './message.schema';

function message(overrides: Partial<Message> = {}): Message {
  return {
    _id: 'msg_1',
    text: { body: 'secret' },
    media: [{ mime: 'image/png', url: 'https://cdn.example/a.png' }],
    dateTimeSend: new Date('2026-08-22T07:00:00Z'),
    canvasId: 'canvas_1',
    dateTimeReveal: new Date('2026-08-22T12:00:00Z'),
    senderId: 'user_author',
    parentMessageId: null,
    tag: null,
    channel: 'web',
    canvasPositionManual: false,
    imageObjects: [],
    ...overrides,
  };
}

describe('toMessageView', () => {
  const now = new Date('2026-08-22T08:00:00Z');

  it('masks text and media for everyone except the author before reveal', () => {
    const view = toMessageView(message(), 'user_other', now);
    expect(view.text).toBeUndefined();
    expect(view.media).toEqual([]);
    expect(view.dateTimeReveal).toBe('2026-08-22T12:00:00.000Z');
  });

  it('lets the author see the full card before reveal', () => {
    const view = toMessageView(message(), 'user_author', now);
    expect(view.text).toEqual({ body: 'secret' });
    expect(view.media).toHaveLength(1);
  });
});
