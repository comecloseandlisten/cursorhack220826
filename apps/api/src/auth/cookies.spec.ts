import { readCookie } from './cookies';

describe('readCookie', () => {
  it('reads a named cookie from the header', () => {
    expect(readCookie('theme=dark; sid=user_1; extra=1', 'sid')).toBe('user_1');
  });

  it('returns undefined when the cookie is missing', () => {
    expect(readCookie('theme=dark', 'sid')).toBeUndefined();
    expect(readCookie(undefined, 'sid')).toBeUndefined();
  });
});
