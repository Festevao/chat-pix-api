import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decodedToken = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
        request.user = decodedToken;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Not authenticated');
      }
    }

    const accessToken = request.cookies['access_token'];

    if (await this.authService.isTokenExpired(accessToken)) {
      const refreshToken = request.cookies['refresh_token'];

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      try {
        const newAccessToken =
          await this.authService.getNewAccessToken(refreshToken);
        request.res.cookie('access_token', newAccessToken, {
          httpOnly: true,
        });
        request.cookies['access_token'] = newAccessToken;

        request.user = JSON.parse(request.cookies['user']);

        return true;
      } catch (error) {
        console.error(error);
        throw new UnauthorizedException('Failed to refresh token');
      }
    } else {
      request.user = JSON.parse(request.cookies['user']);
      return true;
    }
  }
}
