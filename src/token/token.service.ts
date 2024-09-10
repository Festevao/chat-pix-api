import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/base.service';
import { Token } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService extends BaseService<Token> {
  constructor(
    @InjectRepository(Token)
    protected readonly repository: Repository<Token>,
  ) {
    super(repository, Token);
  }

  async findByToken(token: string) {
    return await this.repository.findOne({
      where: {
        token,
      },
      relations: {
        user: true,
      }
    });
  }
}
