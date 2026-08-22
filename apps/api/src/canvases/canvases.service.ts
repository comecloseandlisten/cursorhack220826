import { HttpStatus, Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { ApiError } from '../http/api-error';
import { newId } from '../ids';
import { Canvas } from './canvas.schema';

export type CanvasView = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
};

/** Куда бот кладёт ingest, пока юзер не выбрал канвас (DEFAULT_CANVAS_ID). */
export const DEFAULT_CANVAS_ID = 'canvas_default';

@Injectable()
export class CanvasesService implements OnModuleInit {
  constructor(
    @InjectModel(Canvas.name)
    private readonly canvasModel: Model<Canvas>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.canvasModel.updateOne(
      { _id: DEFAULT_CANVAS_ID },
      {
        $setOnInsert: {
          title: 'Тестовый канвас',
          ownerId: 'system',
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  async list(ownerId: string): Promise<{ items: CanvasView[] }> {
    const docs = await this.canvasModel
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return { items: docs.map(toCanvasView) };
  }

  async create(ownerId: string, body: unknown): Promise<CanvasView> {
    const title = parseTitle(body);
    const created = await this.canvasModel.create({
      _id: newId('canvas'),
      title,
      ownerId,
      createdAt: new Date(),
    });

    return toCanvasView(created);
  }

  async get(canvasId: string): Promise<CanvasView> {
    const doc = await this.canvasModel.findById(canvasId).lean().exec();
    if (!doc) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'canvas_not_found', 'Канвас не найден.');
    }

    return toCanvasView(doc);
  }

  async assertExists(canvasId: string): Promise<void> {
    const exists = await this.canvasModel.exists({ _id: canvasId });
    if (!exists) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'canvas_not_found', 'Канвас не найден.');
    }
  }
}

function parseTitle(body: unknown): string {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'bad_request',
      'Некорректное тело запроса.',
    );
  }

  const title = (body as { title?: unknown }).title;
  if (typeof title !== 'string' || title.trim() === '') {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'empty_title', 'Нужен title.');
  }

  return title.trim();
}

function toCanvasView(doc: {
  _id: string;
  title: string;
  ownerId: string;
  createdAt: Date;
}): CanvasView {
  return {
    id: doc._id,
    title: doc.title,
    ownerId: doc.ownerId,
    createdAt: doc.createdAt.toISOString(),
  };
}
