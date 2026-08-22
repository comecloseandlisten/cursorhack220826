import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ApiError } from '../http/api-error';

@Injectable()
export class BotGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const expected = this.configService.getOrThrow<string>('BOT_TOKEN');

    if (!token || token !== expected) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'unauthorized',
        'Нет или неверный botToken.',
      );
    }

    return true;
  }
}
