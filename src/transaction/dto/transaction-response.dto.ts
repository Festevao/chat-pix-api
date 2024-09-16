import { UserResponseDTO } from 'src/user/dto/user-reponse.dto';
import { TransactionStatus } from '../types/TransactionStatus';
import { Transaction } from '../entities/transaction.entity';

export class TransactionResponseDTO {
  id: string;
  message: string;
  value: number;
  status: TransactionStatus;
  chatId: string;
  pixCopiaECola: string;
  payer?: UserResponseDTO;
  constructor(args: Transaction) {
    this.id = args.id;
    this.message = args.message;
    this.value = args.value;
    this.status = args.status;
    this.chatId = args.chatId;
    this.pixCopiaECola = args.pixCopiaECola;
    this.payer = args.payer ? new UserResponseDTO(args.payer, { hidePrivInfos: true }) : undefined;
  }
}