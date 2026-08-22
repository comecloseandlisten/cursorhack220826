import { selectDigestMessages, type DigestMessage } from './digest-filter';

const root: DigestMessage = {
  _id: 'msg_root',
  parentMessageId: null,
  dateTimeSend: new Date('2026-08-01T10:00:00Z'),
  text: { body: 'Meeting notes' },
  media: [],
  imageObjects: [],
};

const comment: DigestMessage = {
  _id: 'msg_comment',
  parentMessageId: 'msg_root',
  dateTimeSend: new Date('2026-08-02T10:00:00Z'),
  text: { body: 'Паспорт лежит в ящике' },
  media: [],
  imageObjects: [],
};

const photo: DigestMessage = {
  _id: 'msg_photo',
  parentMessageId: null,
  dateTimeSend: new Date('2026-08-03T10:00:00Z'),
  media: [{ mime: 'image/jpeg' }],
  imageObjects: ['кот', 'диван'],
};

const audio: DigestMessage = {
  _id: 'msg_audio',
  parentMessageId: null,
  dateTimeSend: new Date('2026-08-03T11:00:00Z'),
  media: [{ mime: 'audio/mpeg' }],
  imageObjects: ['кот'],
};

describe('selectDigestMessages', () => {
  const all = [audio, photo, comment, root];

  it('returns the full canvas when filters are empty', () => {
    expect(selectDigestMessages(all, {}).map((item) => item._id)).toEqual([
      'msg_audio',
      'msg_photo',
      'msg_comment',
      'msg_root',
    ]);
  });

  it('filters by date range on the message itself', () => {
    expect(
      selectDigestMessages(all, {
        dateFrom: new Date('2026-08-02T00:00:00Z'),
        dateTo: new Date('2026-08-02T23:59:59Z'),
      }).map((item) => item._id),
    ).toEqual(['msg_comment']);
  });

  it('includes a parent when a comment matches the text', () => {
    expect(
      selectDigestMessages(all, { text: 'паспорт' }).map((item) => item._id),
    ).toEqual(['msg_comment', 'msg_root']);
  });

  it('ANDs text with date', () => {
    expect(
      selectDigestMessages(all, {
        text: 'паспорт',
        dateFrom: new Date('2026-08-01T00:00:00Z'),
        dateTo: new Date('2026-08-01T23:59:59Z'),
      }).map((item) => item._id),
    ).toEqual(['msg_root']);
  });

  it('requires an image for imageObject matches', () => {
    expect(
      selectDigestMessages(all, { imageObject: 'кот' }).map((item) => item._id),
    ).toEqual(['msg_photo']);
  });
});
