import {
  Controller,
  Get,
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
    @Res() response: Response,
  ): Promise<void> {
    const file = await this.mediaService.open(mediaId);
    response.setHeader('Content-Type', file.mime);
    file.stream.pipe(response);
  }
}
