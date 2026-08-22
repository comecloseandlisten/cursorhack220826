import { collectTelegramFiles, normalizeMime } from './media';
import type { TelegramMessage } from './telegram';

describe('normalizeMime', () => {
  it('maps telegram aliases onto the contract', () => {
    expect(normalizeMime('image/jpg')).toBe('image/jpeg');
    expect(normalizeMime('audio/mp3')).toBe('audio/mpeg');
    expect(normalizeMime('image/webp')).toBeUndefined();
  });
});

describe('collectTelegramFiles', () => {
  it('takes the largest jpeg photo', () => {
    const message: TelegramMessage = {
      message_id: 1,
      chat: { id: 1, type: 'private' },
      photo: [
        { file_id: 'small', width: 90, height: 90, file_size: 100 },
        { file_id: 'large', width: 1280, height: 720, file_size: 8000 },
      ],
    };

    expect(collectTelegramFiles(message)).toEqual([
      { fileId: 'large', mime: 'image/jpeg', filename: 'photo.jpg' },
    ]);
  });

  it('keeps png documents and mp4 video, skips voice', () => {
    expect(
      collectTelegramFiles({
        message_id: 2,
        chat: { id: 1, type: 'private' },
        document: {
          file_id: 'png',
          mime_type: 'image/png',
          file_name: 'shot.png',
        },
      }),
    ).toEqual([{ fileId: 'png', mime: 'image/png', filename: 'shot.png' }]);

    expect(
      collectTelegramFiles({
        message_id: 3,
        chat: { id: 1, type: 'private' },
        video: { file_id: 'vid', mime_type: 'video/mp4' },
      }),
    ).toEqual([{ fileId: 'vid', mime: 'video/mp4', filename: 'video.mp4' }]);

    expect(
      collectTelegramFiles({
        message_id: 4,
        chat: { id: 1, type: 'private' },
        voice: { file_id: 'ogg', mime_type: 'audio/ogg' },
      }),
    ).toEqual([]);
  });
});
