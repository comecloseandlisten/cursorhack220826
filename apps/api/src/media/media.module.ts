import { Module } from '@nestjs/common';
import { BotGuard } from '../auth/bot.guard';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, BotGuard],
})
export class MediaModule {}
