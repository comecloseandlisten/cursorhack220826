import { HttpException, HttpStatus } from '@nestjs/common';
import {
  chatDedupKey,
  defaultChildPosition,
  dmDedupKey,
  parseChatIngest,
  parseMessageCreate,
} from './message-body';

function errorOf(run: () => unknown): HttpException {
  try {
    run();
    throw new Error('expected ApiError');
  } catch (error) {
    if (error instanceof HttpException) {
      return error;
    }
    throw error;
  }
}

describe('parseMessageCreate', () => {
  it('accepts text-only bodies', () => {
    expect(
      parseMessageCreate({
        canvasId: 'canvas_1',
        text: { body: '  hello  ', fontType: 'serif' },
      }),
    ).toMatchObject({
      canvasId: 'canvas_1',
      text: { body: 'hello', fontType: 'serif' },
      media: [],
    });
  });

  it('accepts media-only bodies', () => {
    expect(
      parseMessageCreate({
        canvasId: 'canvas_1',
        media: [{ mime: 'image/png', url: 'https://cdn.example/a.png' }],
      }).media,
    ).toEqual([{ mime: 'image/png', url: 'https://cdn.example/a.png' }]);
  });

  it('rejects empty bodies', () => {
    const error = errorOf(() =>
      parseMessageCreate({ canvasId: 'canvas_1', text: { body: '   ' } }),
    );
    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(error.getResponse()).toMatchObject({ code: 'empty_body' });
  });

  it('rejects client-supplied server fields', () => {
    const error = errorOf(() =>
      parseMessageCreate({
        id: 'msg_nope',
        canvasId: 'canvas_1',
        text: { body: 'hi' },
      }),
    );
    expect(error.getResponse()).toMatchObject({ code: 'server_field' });
  });

  it('rejects unknown mime types', () => {
    const error = errorOf(() =>
      parseMessageCreate({
        canvasId: 'canvas_1',
        media: [{ mime: 'application/pdf', url: 'https://cdn.example/a.pdf' }],
      }),
    );
    expect(error.getResponse()).toMatchObject({ code: 'bad_mime' });
  });
});

describe('ingest parsers and keys', () => {
  it('requires taggedById for chat ingest', () => {
    const error = errorOf(() =>
      parseChatIngest({
        chatId: 'c1',
        sourceMessageId: 'm1',
        authorId: 'u1',
        canvasId: 'canvas_1',
        text: { body: 'tagged' },
      }),
    );
    expect(error.getResponse()).toMatchObject({ code: 'tagged_by_required' });
  });

  it('builds stable dedup keys', () => {
    expect(chatDedupKey('c1', 'm1')).toBe('chat:c1:m1');
    expect(dmDedupKey('u1', 'm1')).toBe('dm:u1:m1');
  });

  it('places a child next to its parent', () => {
    expect(defaultChildPosition({ x: 10, y: 20 })).toEqual({ x: 50, y: 116 });
  });
});
