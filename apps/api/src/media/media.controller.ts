import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { BotGuard } from '../auth/bot.guard';
import { ApiError } from '../http/api-error';
import { parseByteRange, rangeHeader } from './byte-range';
import {
  MAX_MEDIA_BYTES,
  MediaService,
  type UploadedMedia,
} from './media.service';

@Controller('v1/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseGuards(BotGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_MEDIA_BYTES },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UploadedMedia> {
    if (!file) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        'empty_body',
        'Нужен файл в поле file.',
      );
    }

    return this.mediaService.upload(file);
  }

  @Get(':mediaId')
  async getMedia(
    @Param('mediaId') mediaId: string,
    @Headers('range') range: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const file = await this.mediaService.lookup(mediaId);
      const parsed = parseByteRange(rangeHeader(range), file.length);

      if (parsed.kind === 'unsatisfiable') {
        response.setHeader('Accept-Ranges', 'bytes');
        response.setHeader('Content-Range', `bytes */${file.length}`);
        response.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).end();
        return;
      }

      const start = parsed.kind === 'partial' ? parsed.start : 0;
      const end = parsed.kind === 'partial' ? parsed.end : file.length - 1;

      response.setHeader('Content-Type', file.mime);
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Content-Length', String(end - start + 1));

      if (parsed.kind === 'partial') {
        response.status(HttpStatus.PARTIAL_CONTENT);
        response.setHeader(
          'Content-Range',
          `bytes ${start}-${end}/${file.length}`,
        );
      }

      this.mediaService
        .download(file.id, parsed.kind === 'partial' ? { start, end } : undefined)
        .pipe(response);
    } catch (error) {
      if (error instanceof ApiError) {
        response.status(error.getStatus()).json(error.getResponse());
        return;
      }

      throw error;
    }
  }
}
