export type ByteRange =
  | { kind: 'full' }
  | { kind: 'partial'; start: number; end: number }
  | { kind: 'unsatisfiable' };

export function rangeHeader(
  header: string | string[] | undefined,
): string | undefined {
  return Array.isArray(header) ? header[0] : header;
}

export function parseByteRange(
  header: string | undefined,
  size: number,
): ByteRange {
  if (!header) {
    return { kind: 'full' };
  }

  if (size <= 0) {
    return { kind: 'unsatisfiable' };
  }

  const match = /^bytes=(\d*)-(\d*)$/i.exec(header.trim());
  if (!match) {
    return { kind: 'full' };
  }

  const startRaw = match[1] ?? '';
  const endRaw = match[2] ?? '';

  if (startRaw === '' && endRaw === '') {
    return { kind: 'unsatisfiable' };
  }

  let start: number;
  let end: number;

  if (startRaw === '') {
    const suffix = Number(endRaw);
    if (!Number.isFinite(suffix) || suffix <= 0) {
      return { kind: 'unsatisfiable' };
    }

    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(startRaw);
    end = endRaw === '' ? size - 1 : Number(endRaw);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return { kind: 'unsatisfiable' };
    }

    if (end >= size) {
      end = size - 1;
    }

    if (start > end || start >= size) {
      return { kind: 'unsatisfiable' };
    }
  }

  return { kind: 'partial', start, end };
}
