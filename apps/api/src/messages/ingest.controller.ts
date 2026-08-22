import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { BotGuard } from '../auth/bot.guard';
import { MessagesService } from './messages.service';

@Controller('v1/ingest')
@UseGuards(BotGuard)
export class IngestController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('chat')
  async ingestChat(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.messagesService.ingestChat(body);
    response.status(
      result.created ? HttpStatus.CREATED : HttpStatus.OK,
    );
    return result.message;
  }

  @Post('dm')
  async ingestDm(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.messagesService.ingestDm(body);
    response.status(
      result.created ? HttpStatus.CREATED : HttpStatus.OK,
    );
    return result.message;
  }
}
