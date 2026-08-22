import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id';
import { SessionGuard } from '../auth/session.guard';
import { MessagesService } from './messages.service';

@Controller('v1/messages')
@UseGuards(SessionGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  list(
    @CurrentUserId() userId: string,
    @Query('canvasId') canvasId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('text') text?: string,
    @Query('imageObject') imageObject?: string,
  ) {
    return this.messagesService.list(userId, {
      canvasId,
      dateFrom,
      dateTo,
      text,
      imageObject,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: string, @Body() body: unknown) {
    return this.messagesService.createWeb(userId, body);
  }

  @Get(':messageId')
  get(@CurrentUserId() userId: string, @Param('messageId') messageId: string) {
    return this.messagesService.get(userId, messageId);
  }
}
