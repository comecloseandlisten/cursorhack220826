import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from './session.guard';

export const CurrentUserId = createParamDecorator(
  (_value: unknown, context: ExecutionContext): string => {
    return context.switchToHttp().getRequest<AuthedRequest>().userId;
  },
);
