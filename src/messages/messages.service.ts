import { Injectable } from '@nestjs/common';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class MessagesService {
  constructor(private transactionService: TransactionService) {}

  async getAllMessages() {
    
  }
}
