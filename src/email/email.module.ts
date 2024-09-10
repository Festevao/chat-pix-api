import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>('SMTP_HOST'),
            secure: configService.get<string>('SMTP_SECURE') === 'true',
            port: parseInt(configService.get<string>('SMTP_PORT')),
            auth: {
              user: configService.get<string>('SMTP_USER'),
              pass: configService.get<string>('SMTP_PASS'),
            },
            ignoreTLS: configService.get<string>('SMTP_IGNORE_TLS') === 'true',
          },
          defaults: {
            from: configService.get<string>('SMTP_FROM'),
          },
          template: {
            dir: path.resolve(__dirname, '..', '..', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              extName: '.hbs',
              layoutsDir: path.resolve(__dirname, '..', '..', 'templates'),
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
