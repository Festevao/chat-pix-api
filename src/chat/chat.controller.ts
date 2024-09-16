import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateChatDTO } from './dto/create-chat.dto';
import { ChatResponseDTO } from './dto/chat-response.dto';
import { UpdateChatDTO } from './dto/update-chat.dto';
import { matches } from 'class-validator';

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
}
