import { HttpStatus, Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import type { Connection } from 'mongoose';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ApiError } from '../http/api-error';
import { MEDIA_MIMES, type MediaMime } from '../messages/message.types';

// Telegram getFile отдаёт максимум 20MB — столько же принимаем и мы.
export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;

export type UploadedMedia = {
  mime: MediaMime;
  url: string;
};

@Injectable()
export class MediaService implements OnModuleInit {
  private bucket: GridFSBucket | undefined;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    if (!this.connection.db) {
      throw new Error('Mongo database is not available');
    }

    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'media' });
  }

  async upload(file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
  }): Promise<UploadedMedia> {
    if (!isMediaMime(file.mimetype)) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'bad_mime',
        'Недопустимый mime.',
      );
    }

    if (file.size > MAX_MEDIA_BYTES) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'file_too_large',
        'Файл больше лимита бота в 20MB.',
      );
    }

    const id = new ObjectId();
    const upload = this.getBucket().openUploadStreamWithId(
      id,
      file.originalname,
      { metadata: { mime: file.mimetype } },
    );

    await pipeline(Readable.from(file.buffer), upload);

    const baseUrl = this.configService.getOrThrow<string>('PUBLIC_BASE_URL');

    return {
      mime: file.mimetype,
      url: `${baseUrl}/api/v1/media/${id.toHexString()}`,
    };
  }

  async open(mediaId: string): Promise<{
    mime: string;
    stream: ReturnType<GridFSBucket['openDownloadStream']>;
  }> {
    if (!ObjectId.isValid(mediaId)) {
      throw mediaNotFound();
    }

    const objectId = new ObjectId(mediaId);
    const files = await this.getBucket()
      .find({ _id: objectId })
      .limit(1)
      .toArray();
    const file = files[0];

    if (!file) {
      throw mediaNotFound();
    }

    const mime =
      typeof file.metadata?.['mime'] === 'string'
        ? file.metadata['mime']
        : 'application/octet-stream';

    return {
      mime,
      stream: this.getBucket().openDownloadStream(objectId),
    };
  }

  private getBucket(): GridFSBucket {
    if (!this.bucket) {
      throw new Error('Media bucket is not initialized');
    }

    return this.bucket;
  }
}

function mediaNotFound(): ApiError {
  return new ApiError(
    HttpStatus.NOT_FOUND,
    'media_not_found',
    'Файл не найден.',
  );
}

function isMediaMime(value: string): value is MediaMime {
  return (MEDIA_MIMES as readonly string[]).includes(value);
}
