import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { HealthController } from './health.controller';
import type { HealthService } from './health.service';
import type { HealthResponse } from './health.types';

function createResponse(): Response {
  return {
    status: jest.fn(),
  } as unknown as Response;
}

function createController(health: HealthResponse): HealthController {
  const healthService = {
    getHealth: jest.fn(() => health),
  } as unknown as HealthService;

  return new HealthController(healthService);
}

describe('HealthController', () => {
  it('returns HTTP 200 for a healthy service', () => {
    const response = createResponse();
    const health: HealthResponse = {
      status: 'ok',
      service: '@cursorhack/api',
      mongo: { status: 'connected', readyState: 1 },
    };

    expect(createController(health).getHealth(response)).toBe(health);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
  });

  it('returns HTTP 503 for a degraded service', () => {
    const response = createResponse();
    const health: HealthResponse = {
      status: 'degraded',
      service: '@cursorhack/api',
      mongo: { status: 'disconnected', readyState: 0 },
    };

    expect(createController(health).getHealth(response)).toBe(health);
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  });
});
