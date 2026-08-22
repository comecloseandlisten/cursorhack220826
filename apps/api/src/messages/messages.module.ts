import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotGuard } from '../auth/bot.guard';
import { SessionGuard } from '../auth/session.guard';
import { CanvasesModule } from '../canvases/canvases.module';
import { IngestController } from './ingest.controller';
import { Message, MessageSchema } from './message.schema';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    CanvasesModule,
  ],
  controllers: [MessagesController, IngestController],
  providers: [MessagesService, SessionGuard, BotGuard],
})
export class MessagesModule {}
