import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
          ConfigModule.forRoot({
          isGlobal: true,
        }),
        MailerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            console.log(
              configService.get<string>('SMTP_HOST'),
              configService.get<string>('SMTP_SECURE'),
              configService.get<string>('SMTP_PORT'),
              configService.get<string>('SMTP_USER'),
              configService.get<string>('SMTP_PASS'),
              configService.get<string>('SMTP_IGNORE_TLS'),
              configService.get<string>('SMTP_FROM'),
            );
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
            };
          },
        }),
      ],
      providers: [EmailService, MailerService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a email', async () => {
    const result = await service.sendEmail('cadefm@hotmail.com', 'testando 123', 'testando 123');

    expect(result).toBeDefined();
  });
});
