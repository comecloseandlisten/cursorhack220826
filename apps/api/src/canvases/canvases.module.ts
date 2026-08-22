import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionGuard } from '../auth/session.guard';
import { Canvas, CanvasSchema } from './canvas.schema';
import { CanvasesController } from './canvases.controller';
import { CanvasesService } from './canvases.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Canvas.name, schema: CanvasSchema }]),
  ],
  controllers: [CanvasesController],
  providers: [CanvasesService, SessionGuard],
  exports: [CanvasesService],
})
export class CanvasesModule {}
