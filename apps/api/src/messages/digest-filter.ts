import { IMAGE_MIMES } from './message.types';

export type DigestMessage = {
  _id: string;
  parentMessageId?: string | null;
  dateTimeSend: Date;
  text?: { body: string };
  media?: { mime: string }[];
  imageObjects?: string[];
};

export type DigestFilters = {
  dateFrom?: Date;
  dateTo?: Date;
  text?: string;
  imageObject?: string;
};

export function selectDigestMessages<T extends DigestMessage>(
  messages: readonly T[],
  filters: DigestFilters,
): T[] {
  const childrenByParent = groupChildren(messages);

  return messages.filter((message) => {
    if (filters.dateFrom && message.dateTimeSend < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && message.dateTimeSend > filters.dateTo) {
      return false;
    }

    if (filters.imageObject && !matchesImageObject(message, filters.imageObject)) {
      return false;
    }

    if (filters.text) {
      const needle = filters.text.toLowerCase();
      const selfMatch = containsText(message, needle);
      const childMatch = descendantMatches(message._id, needle, childrenByParent);
      if (!selfMatch && !childMatch) {
        return false;
      }
    }

    return true;
  });
}

function groupChildren<T extends DigestMessage>(
  messages: readonly T[],
): Map<string, T[]> {
  const childrenByParent = new Map<string, T[]>();

  for (const message of messages) {
    if (!message.parentMessageId) {
      continue;
    }

    const siblings = childrenByParent.get(message.parentMessageId) ?? [];
    siblings.push(message);
    childrenByParent.set(message.parentMessageId, siblings);
  }

  return childrenByParent;
}

function descendantMatches<T extends DigestMessage>(
  parentId: string,
  needle: string,
  childrenByParent: Map<string, T[]>,
): boolean {
  const children = childrenByParent.get(parentId) ?? [];

  return children.some(
    (child) =>
      containsText(child, needle) ||
      descendantMatches(child._id, needle, childrenByParent),
  );
}

function containsText(message: DigestMessage, needle: string): boolean {
  return (message.text?.body ?? '').toLowerCase().includes(needle);
}

function matchesImageObject(message: DigestMessage, query: string): boolean {
  const media = message.media ?? [];
  const hasImage = media.some((item) => IMAGE_MIMES.has(item.mime));
  if (!hasImage) {
    return false;
  }

  const needle = query.toLowerCase();
  return (message.imageObjects ?? []).some((object) =>
    object.toLowerCase().includes(needle),
  );
}
