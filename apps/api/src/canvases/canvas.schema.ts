import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type CanvasDocument = HydratedDocument<Canvas>;

@Schema({ collection: 'canvases', versionKey: false })
export class Canvas {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: String, required: true })
  ownerId!: string;

  @Prop({ type: Date, required: true })
  createdAt!: Date;
}

export const CanvasSchema = SchemaFactory.createForClass(Canvas);

CanvasSchema.index({ ownerId: 1, createdAt: -1 });
