import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JWTPayload } from 'src/auth/types/JwtPayload';

export const TokenPayload = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JWTPayload;
  },
);
