import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiError } from '../http/api-error';
import { readCookie } from './cookies';

export type AuthedRequest = Request & { userId: string };

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const userId = readCookie(request.headers.cookie, 'sid')?.trim();

    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'unauthorized', 'Нужна сессия.');
    }

    request.userId = userId;
    return true;
  }
}
