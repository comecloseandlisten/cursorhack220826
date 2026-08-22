export type ServiceStatus = 'ok' | 'degraded';

export type MongoConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'disconnecting'
  | 'uninitialized'
  | 'unknown';

export interface HealthResponse {
  status: ServiceStatus;
  service: '@cursorhack/api';
  mongo: {
    status: MongoConnectionStatus;
    readyState: number;
  };
}
