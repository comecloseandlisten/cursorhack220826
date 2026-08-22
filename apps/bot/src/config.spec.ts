import { parseChatCanvasMap, resolveCanvasId } from './config';

describe('parseChatCanvasMap', () => {
  it('maps chat ids onto canvases', () => {
    expect(parseChatCanvasMap('-1001:canvas_a,-1002:canvas_b')).toEqual({
      '-1001': 'canvas_a',
      '-1002': 'canvas_b',
    });
  });
});

describe('resolveCanvasId', () => {
  it('falls back to the default canvas', () => {
    expect(resolveCanvasId('-9', { '-1001': 'canvas_a' }, 'canvas_default')).toBe(
      'canvas_default',
    );
    expect(resolveCanvasId('-1001', { '-1001': 'canvas_a' }, 'canvas_default')).toBe(
      'canvas_a',
    );
  });
});
