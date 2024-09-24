import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateChatDTO } from './dto/create-chat.dto';
import { ChatResponseDTO } from './dto/chat-response.dto';
import { UpdateChatDTO } from './dto/update-chat.dto';
import { matches } from 'class-validator';
import { Public } from 'src/auth/guards/public.guard';

@ApiTags('Chat')
@ApiSecurity('Auth')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('user')
  async getByUser(@Req() req) {
    const result = await this.chatService.findByUser(req.user.sub);

    return result.map((chat) => new ChatResponseDTO(chat));
  }

  @Post('create')
  async createChat(
    @Req() req,
    @Body() createChatDto: CreateChatDTO,
  ) {
    return new ChatResponseDTO(await this.chatService.createByUser(req.user.sub, createChatDto));
  }

  @Put('update')
  async updateChat(
    @Req() req,
    @Body() updateChatDto: UpdateChatDTO,
  ) {
    return new ChatResponseDTO(await this.chatService.updateByUser(req.user.sub, updateChatDto));
  }

  @Delete('delete/:chatId')
  async delete(
    @Req() req,
    @Param('chatId') chatId: string,
  ) {
    await this.chatService.deleteByUser(req.user.sub, chatId);
  }

  @Get('nick/:nick')
  async findAllByNick(
    @Param('nick') nick: string,
  ) {
    if (!matches(nick, /^[a-zA-Z_ ]+$/)) {
      throw new BadRequestException('nick must match /^[a-zA-Z_ ]+$/');
    }
    const chats = await this.chatService.findAllByOwnerNick(nick);
    return chats.map((chat) => {
      return new ChatResponseDTO(chat);
    });
  }

  @Get('messages/:chatId')
  @Public()
  async findAllMessagesByChat(
    @Param('chatId') chatId: string,
    @Headers('x-api-key') apikey: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    if (!chatId) {
      throw new BadRequestException('Missing chatId param');
    }
    if (!apikey) {
      throw new UnauthorizedException('Missing x-api-key header');
    }
    const pageNumber = page ? parseInt(page) : undefined;
    const pageSizeNumber = pageSize ? parseInt(pageSize) : undefined;
    
    if (pageNumber !== undefined && isNaN(pageNumber)) {
      throw new BadRequestException('page param must be an integer');
    }
    if (pageSizeNumber !== undefined && isNaN(pageSizeNumber)) {
      throw new BadRequestException('pageSize param must be an integer');
    }
    if (pageNumber < 1) {
      throw new BadRequestException('page param must be bigger then 0');
    }
    if (pageSizeNumber < 1 || pageSizeNumber > 100) {
      throw new BadRequestException('pageSize param must be in the range 1-100');
    }

    return await this.chatService.findAllMessages(chatId, apikey, pageNumber, pageSizeNumber);
  }
}
