import { createServer } from 'node:http';
import { createBot } from './bot';
import { loadConfig } from './config';
import { DigestApi } from './digest-api';

async function main(): Promise<void> {
  const config = loadConfig();
  const health = createServer((_request, response) => {
    const idle = config.telegramBotToken === '';
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        status: idle ? 'idle' : 'ok',
        service: '@cursorhack/bot',
      }),
    );
  });

  await new Promise<void>((resolve) => {
    health.listen(config.healthPort, resolve);
  });

  if (!config.telegramBotToken) {
    console.warn('TELEGRAM_BOT_TOKEN is empty — bot is idle');
    return;
  }

  if (!config.digestBotToken) {
    throw new Error('DIGEST_BOT_TOKEN is required when the Telegram bot is enabled');
  }

  const digest = new DigestApi(config.digestApiBaseUrl, config.digestBotToken);
  const bot = createBot(config, digest);

  await bot.start({
    allowed_updates: ['message'],
    drop_pending_updates: false,
    onStart: (info) => {
      console.log(`Telegram bot @${info.username} started`);
    },
  });
}

void main().catch((error: unknown) => {
  console.error(
    'Failed to start bot',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});
