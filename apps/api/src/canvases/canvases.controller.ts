import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id';
import { SessionGuard } from '../auth/session.guard';
import { CanvasesService } from './canvases.service';

@Controller('v1/canvases')
@UseGuards(SessionGuard)
export class CanvasesController {
  constructor(private readonly canvasesService: CanvasesService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.canvasesService.list(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: string, @Body() body: unknown) {
    return this.canvasesService.create(userId, body);
  }

  @Get(':canvasId')
  get(@Param('canvasId') canvasId: string) {
    return this.canvasesService.get(canvasId);
  }
}
