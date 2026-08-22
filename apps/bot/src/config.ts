export type BotConfig = {
  telegramBotToken: string;
  digestApiBaseUrl: string;
  digestBotToken: string;
  defaultCanvasId: string;
  chatCanvasMap: Record<string, string>;
  healthPort: number;
};

export function loadConfig(
  environment: NodeJS.ProcessEnv = process.env,
): BotConfig {
  return {
    telegramBotToken: readOptional(environment.TELEGRAM_BOT_TOKEN),
    digestApiBaseUrl: stripTrailingSlash(
      readOptional(environment.DIGEST_API_BASE_URL) ||
        'http://localhost:3000/api/v1',
    ),
    digestBotToken: readOptional(environment.DIGEST_BOT_TOKEN),
    defaultCanvasId:
      readOptional(environment.DEFAULT_CANVAS_ID) || 'canvas_default',
    chatCanvasMap: parseChatCanvasMap(environment.CHAT_CANVAS_MAP),
    healthPort: readPort(environment.HEALTH_PORT, 3001),
  };
}

export function resolveCanvasId(
  chatId: string,
  map: Record<string, string>,
  fallback: string,
): string {
  return map[chatId] ?? fallback;
}

export function parseChatCanvasMap(value: string | undefined): Record<string, string> {
  if (!value || value.trim() === '') {
    return {};
  }

  const map: Record<string, string> = {};

  for (const entry of value.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) {
      continue;
    }

    const separator = trimmed.indexOf(':');
    if (separator <= 0 || separator === trimmed.length - 1) {
      throw new Error(`Invalid CHAT_CANVAS_MAP entry: ${trimmed}`);
    }

    map[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
  }

  return map;
}

function readOptional(value: string | undefined): string {
  return value?.trim() ?? '';
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function readPort(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('HEALTH_PORT must be an integer between 1 and 65535');
  }

  return port;
}
