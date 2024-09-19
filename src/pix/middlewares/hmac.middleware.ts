import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class HMACValidationMiddleware implements NestMiddleware {
  private readonly secretKey = process.env.HMAC_KEY;

  use(req: Request, res: Response, next: NextFunction) {
    const receivedHmac = req.query.hmac as string;
    const urlWithoutHmac = `https://${req.get('host')}${req.originalUrl.split('?')[0]}`;

    if (!receivedHmac) {
      throw new HttpException('HMAC is missing', HttpStatus.BAD_REQUEST);
    }

    const calculatedHmac = crypto.createHmac('sha256', this.secretKey).update(urlWithoutHmac).digest('hex');

    if (receivedHmac !== calculatedHmac) {
      throw new HttpException('Invalid HMAC', HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
