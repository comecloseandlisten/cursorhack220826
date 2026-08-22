import type { AllowedMime } from './digest-api';
import type { TelegramFilePart, TelegramMessage, TelegramPhotoSize } from './telegram';

const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024;

const MIME_ALIASES: Record<string, AllowedMime> = {
  'image/jpg': 'image/jpeg',
  'audio/mp3': 'audio/mpeg',
};

export type TelegramFileRef = {
  fileId: string;
  mime: AllowedMime;
  filename: string;
};

export function collectTelegramFiles(message: TelegramMessage): TelegramFileRef[] {
  const files: TelegramFileRef[] = [];
  const largestPhoto = pickLargestPhoto(message.photo);

  if (largestPhoto) {
    files.push({
      fileId: largestPhoto.file_id,
      mime: 'image/jpeg',
      filename: 'photo.jpg',
    });
  }

  pushPart(files, message.animation, guessAnimationMime, 'animation.mp4');
  pushPart(files, message.video, () => 'video/mp4', 'video.mp4');
  pushPart(files, message.video_note, () => 'video/mp4', 'video_note.mp4');
  pushPart(files, message.audio, guessAudioMime, 'audio.mp3');
  pushPart(files, message.document, guessDocumentMime, 'file');

  return files;
}

export function normalizeMime(value: string | undefined): AllowedMime | undefined {
  if (!value) {
    return undefined;
  }

  const aliased = MIME_ALIASES[value.toLowerCase()] ?? value.toLowerCase();
  if (
    aliased === 'video/mp4' ||
    aliased === 'audio/mpeg' ||
    aliased === 'image/jpeg' ||
    aliased === 'image/png' ||
    aliased === 'image/gif'
  ) {
    return aliased;
  }

  return undefined;
}

export function isDownloadableSize(fileSize: number | undefined): boolean {
  return fileSize === undefined || fileSize <= MAX_DOWNLOAD_BYTES;
}

function pushPart(
  files: TelegramFileRef[],
  part: TelegramFilePart | undefined,
  mimeOf: (part: TelegramFilePart) => AllowedMime | undefined,
  fallbackName: string,
): void {
  if (!part || !isDownloadableSize(part.file_size)) {
    return;
  }

  const mime = mimeOf(part);
  if (!mime) {
    return;
  }

  files.push({
    fileId: part.file_id,
    mime,
    filename: part.file_name || fallbackName,
  });
}

function pickLargestPhoto(
  photos: TelegramPhotoSize[] | undefined,
): TelegramPhotoSize | undefined {
  if (!photos || photos.length === 0) {
    return undefined;
  }

  return photos.reduce((best, current) =>
    (current.file_size ?? 0) >= (best.file_size ?? 0) ? current : best,
  );
}

function guessAnimationMime(part: TelegramFilePart): AllowedMime | undefined {
  const fromType = normalizeMime(part.mime_type);
  if (fromType) {
    return fromType;
  }

  if (part.file_name?.toLowerCase().endsWith('.gif')) {
    return 'image/gif';
  }

  return 'video/mp4';
}

function guessAudioMime(part: TelegramFilePart): AllowedMime | undefined {
  return normalizeMime(part.mime_type);
}

function guessDocumentMime(part: TelegramFilePart): AllowedMime | undefined {
  return normalizeMime(part.mime_type);
}
