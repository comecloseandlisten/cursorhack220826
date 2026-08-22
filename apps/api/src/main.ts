import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { parseCorsOrigins } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  const corsOrigins = parseCorsOrigins(
    configService.getOrThrow<string>('CORS_ORIGIN'),
  );

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.enableCors({
    credentials: true,
    origin: corsOrigins,
  });
  app.use(helmet());

  await app.listen(port);
}

const logger = new Logger('Bootstrap');

void bootstrap().catch((error: unknown) => {
  logger.error(
    'Failed to start API',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});
