import { BadRequestException, Controller, Get, Headers, Param, UnauthorizedException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Public } from 'src/auth/guards/public.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('all/:chatId')
  @Public()
  async getAllMessages(
    @Headers('x-api-key') apiKey: string,
    @Param('chatId') chatId: string,
  ) {
    if (!apiKey) {
      throw new UnauthorizedException('x-api-key is missing on header');
    }
    if (!chatId) {
      throw new BadRequestException('chadId is missing on params');
    }
  }
}
