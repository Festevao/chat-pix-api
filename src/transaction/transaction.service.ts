import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/base.service';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    protected readonly repository: Repository<Transaction>,
  ) {
    super(repository, Transaction);
  }
}