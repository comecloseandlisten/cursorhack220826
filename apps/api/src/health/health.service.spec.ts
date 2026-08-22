import type { Connection } from 'mongoose';
import { HealthService } from './health.service';

function createService(readyState: number): HealthService {
  return new HealthService({ readyState } as Connection);
}

describe('HealthService', () => {
  it('reports a healthy service when Mongo is connected', () => {
    expect(createService(1).getHealth()).toEqual({
      status: 'ok',
      service: '@cursorhack/api',
      mongo: {
        status: 'connected',
        readyState: 1,
      },
    });
  });

  it('reports a degraded service when Mongo is disconnected', () => {
    expect(createService(0).getHealth()).toEqual({
      status: 'degraded',
      service: '@cursorhack/api',
      mongo: {
        status: 'disconnected',
        readyState: 0,
      },
    });
  });

  it('preserves unknown Mongoose connection states', () => {
    expect(createService(42).getHealth().mongo).toEqual({
      status: 'unknown',
      readyState: 42,
    });
  });
});
