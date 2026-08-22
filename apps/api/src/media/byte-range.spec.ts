import { parseByteRange } from './byte-range';

describe('parseByteRange', () => {
  it('returns the full file when no Range header is sent', () => {
    expect(parseByteRange(undefined, 1000)).toEqual({ kind: 'full' });
  });

  it('parses an open-ended range used by HTML5 video', () => {
    expect(parseByteRange('bytes=0-', 1000)).toEqual({
      kind: 'partial',
      start: 0,
      end: 999,
    });
  });

  it('parses a closed byte range', () => {
    expect(parseByteRange('bytes=0-1', 1000)).toEqual({
      kind: 'partial',
      start: 0,
      end: 1,
    });
  });

  it('rejects a range past the end of the file', () => {
    expect(parseByteRange('bytes=1000-1001', 1000)).toEqual({
      kind: 'unsatisfiable',
    });
  });
});
