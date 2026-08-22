import { HttpStatus, type INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HealthController } from '../src/health/health.controller';
import { HealthService } from '../src/health/health.service';

describe('GET /api/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: getConnectionToken(),
          useValue: { readyState: 1 },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns health without connecting to MongoDB', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(HttpStatus.OK)
      .expect({
        status: 'ok',
        service: '@cursorhack/api',
        mongo: {
          status: 'connected',
          readyState: 1,
        },
      });
  });
});
