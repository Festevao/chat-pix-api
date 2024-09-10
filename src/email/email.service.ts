import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  async sendTemplateEmail(to: string, subject: string, template: string, context?: object) {
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
