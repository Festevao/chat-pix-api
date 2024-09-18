import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/base.service';
import { Wallet } from './entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService extends BaseService<Wallet> {
  constructor(
    @InjectRepository(Wallet)
    protected readonly repository: Repository<Wallet>,
  ) {
    super(repository, Wallet);
  }
}
