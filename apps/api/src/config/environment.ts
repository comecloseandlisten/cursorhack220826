const DEFAULT_PORT = 3000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

export interface Environment {
  BOT_TOKEN: string;
  MONGODB_URI: string;
  PORT: number;
  CORS_ORIGIN: string;
}

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> & Environment {
  const mongodbUri = readMongoUri(environment.MONGODB_URI);
  const port = readPort(environment.PORT);
  const botToken = readRequiredString(environment.BOT_TOKEN, 'BOT_TOKEN');
  const corsOrigins = parseCorsOrigins(
    environment.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
  );

  return {
    ...environment,
    BOT_TOKEN: botToken,
    MONGODB_URI: mongodbUri,
    PORT: port,
    CORS_ORIGIN: corsOrigins.join(','),
  };
}

export function parseCorsOrigins(value: unknown): string[] {
  if (typeof value !== 'string') {
    throw new Error('CORS_ORIGIN must be a comma-separated string');
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGIN must contain at least one origin');
  }

  return [...new Set(origins)];
}

function readMongoUri(value: unknown): string {
  return readRequiredString(value, 'MONGODB_URI');
}

function readRequiredString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} is required`);
  }

  return value.trim();
}

function readPort(value: unknown): number {
  const port = value === undefined ? DEFAULT_PORT : Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

function normalizeOrigin(origin: string): string {
  let url: URL;

  try {
    url = new URL(origin);
  } catch {
    throw new Error(`Invalid CORS origin: ${origin}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`CORS origin must use HTTP or HTTPS: ${origin}`);
  }

  return url.origin;
}
