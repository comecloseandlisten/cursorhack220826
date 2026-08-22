import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type { HealthResponse, MongoConnectionStatus } from './health.types';

const CONNECTED_STATE = 1;

const MONGO_CONNECTION_STATUSES: Readonly<
  Record<number, MongoConnectionStatus>
> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized',
};

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  getHealth(): HealthResponse {
    const readyState = this.connection.readyState;

    return {
      status: readyState === CONNECTED_STATE ? 'ok' : 'degraded',
      service: '@cursorhack/api',
      mongo: {
        status: MONGO_CONNECTION_STATUSES[readyState] ?? 'unknown',
        readyState,
      },
    };
  }
}
