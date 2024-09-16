import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../core/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryFailedError, Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDTO } from './dto/create-chat.dto';
import { UpdateChatDTO } from './dto/update-chat.dto';

@Injectable()
export class ChatService extends BaseService<Chat> {
  constructor(
    @InjectRepository(Chat)
    protected readonly repository: Repository<Chat>,
  ) {
    super(repository, Chat);
  }

  async findWithOwner(chatId: string, args?: FindOptionsWhere<Chat>) {
    const returnValue = await this.repository.findOne({
      where: {
        ...args,
        id: chatId,
        isActive: true,
      },
      relations: {
        user: true,
      }
    });
    if (!returnValue) {
      throw new NotFoundException(`Chat not found`);
    }

    return returnValue;
  }

  async findByUser(userId: string) {
    return await this.repository.find({
      where: {
        userId,
      }
    });
  }

  async createByUser(userId: string, dto: CreateChatDTO) {
   const chat = this.repository.create({
      ...dto,
      userId,
    });
    return await this.repository.save(chat);
  }

  async updateByUser(userId: string, dto: UpdateChatDTO) {
    try {
      const id = dto.chatId;

      if(dto.chatId) {
        delete dto.chatId;
      }

      const updateResult = await this.repository.update({
          id,
          userId,
        }, {
          ...dto,
        }
      );

      if (updateResult.affected === 0) {
        throw new NotFoundException('Chat not found or does not belong to this user.');
      }
  
      return this.repository.findOne({
        where: {
          id: dto.chatId,
          userId,
        },
      });
    } catch(e) {
      console.error(e);
      if (e instanceof QueryFailedError) {
        throw new NotFoundException('Chat not found or does not belong to this user');
      }
  
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async deleteByUser(userId: string, chatId: string) {
    try {
      const deleteResult = await this.repository.delete({
        id: chatId,
        userId,
      });
  
      if (deleteResult.affected === 0) {
        throw new NotFoundException('Chat not found or does not belong to this user');
      }
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new NotFoundException('Chat not found or does not belong to this user');
      }
  
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async findAllByOwnerNick(nick: string) {
    const entities = await this.repository.find({
      where: {
        isActive: true,
        user: {
          nick,
        },
      },
    });

    if (!entities || entities.length === 0) {
      throw new NotFoundException(`Chats not found`);
    }

    return entities;
  }
}