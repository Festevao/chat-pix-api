import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { urlencoded, json } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AuthGuard } from './auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { Reflector } from '@nestjs/core';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const config = new DocumentBuilder()
    .setTitle('ChatPIX API')
    .setDescription('Documentação API do ChatPIX')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Chat')
    .addTag('Transaction')
    .addTag('Wallet')
    .addTag('Pix')
    .addApiKey({ type: 'apiKey', name: 'Authorization', in: 'header' }, 'Auth')
    .build();

  app.enableCors();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'ChatPix - API',
  });

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalGuards(new AuthGuard(app.get(JwtService), app.get(AuthService), app.get(Reflector)));

  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));
  app.use(cookieParser());

  const port = process.env.PORT ?? 3000;
  process.env.PORT = port.toString();

  await app.listen(port);
}

bootstrap();
