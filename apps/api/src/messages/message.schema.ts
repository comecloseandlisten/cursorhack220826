import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import {
  MEDIA_MIMES,
  type Channel,
  type MediaMime,
} from './message.types';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ _id: false })
export class TextBlock {
  @Prop({ type: String, required: true, trim: true })
  body!: string;

  @Prop({ type: String })
  fontType?: string;

  @Prop({ type: String })
  design?: string;

  @Prop({ type: Number })
  size?: number;
}

@Schema({ _id: false })
export class MediaItem {
  @Prop({ type: String, required: true, enum: [...MEDIA_MIMES] })
  mime!: MediaMime;

  @Prop({ type: String, required: true })
  url!: string;
}

@Schema({ _id: false })
export class CanvasPosition {
  @Prop({ type: Number, required: true })
  x!: number;

  @Prop({ type: Number, required: true })
  y!: number;
}

@Schema({ _id: false })
export class MessageSource {
  @Prop({ type: String, required: true })
  dedupKey!: string;

  @Prop({ type: String })
  chatId?: string;

  @Prop({ type: String })
  chatTitle?: string;

  @Prop({ type: String, required: true })
  sourceMessageId!: string;

  @Prop({ type: String })
  taggedById?: string;

  @Prop({ type: String })
  sourceUrl?: string;
}

const TextBlockSchema = SchemaFactory.createForClass(TextBlock);
const MediaItemSchema = SchemaFactory.createForClass(MediaItem);
const CanvasPositionSchema = SchemaFactory.createForClass(CanvasPosition);
const MessageSourceSchema = SchemaFactory.createForClass(MessageSource);

@Schema({ collection: 'messages', versionKey: false })
export class Message {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: TextBlockSchema })
  text?: TextBlock;

  @Prop({ type: String })
  revealAnimation?: string;

  @Prop({ type: [MediaItemSchema], default: [] })
  media!: MediaItem[];

  @Prop({ type: Date, required: true })
  dateTimeSend!: Date;

  @Prop({ type: String, required: true })
  canvasId!: string;

  @Prop({ type: Date })
  dateTimeReveal?: Date;

  @Prop({ type: String, required: true })
  senderId!: string;

  @Prop({ type: String, default: null })
  parentMessageId!: string | null;

  @Prop({ type: CanvasPositionSchema })
  canvasPosition?: CanvasPosition;

  @Prop({ type: Boolean, default: false })
  canvasPositionManual!: boolean;

  @Prop({ type: String, default: null })
  tag!: string | null;

  @Prop({ type: String, required: true, enum: ['web', 'chat', 'dm'] })
  channel!: Channel;

  @Prop({ type: [String], default: [] })
  imageObjects!: string[];

  @Prop({ type: MessageSourceSchema })
  source?: MessageSource;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ canvasId: 1, dateTimeSend: -1 });
MessageSchema.index({ canvasId: 1, parentMessageId: 1 });
MessageSchema.index({ canvasId: 1, imageObjects: 1 });
MessageSchema.index(
  { 'source.dedupKey': 1 },
  { unique: true, sparse: true },
);
