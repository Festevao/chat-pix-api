import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { BaseService } from 'src/core/base.service';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { PixService } from 'src/pix/pix.service';
import { UserService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';
import { validateDocument } from 'src/utils/filterDocument';
import { DevedorCnpj, DevedorCpf } from 'src/pix/types/PixChargeParams';
import { TransactionResponseDTO } from './dto/transaction-response.dto';
import { TransactionStatus } from './types/TransactionStatus';

@Injectable()
export class TransactionService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    protected readonly repository: Repository<Transaction>,
    private pixService: PixService,
    private userService: UserService,
    private chatService: ChatService,
  ) {
    super(repository, Transaction);
  }

  async createTransaction(dto: CreateTransactionDTO, payerId: string) {
    const chat = await this.chatService.findWithOwner(dto.chatId);

    if(dto.value < chat.minValue) {
      throw new UnprocessableEntityException(`This chat have ${chat.minValue} cents as min value.`);
    }

    const payer = await this.userService.findById(payerId);

    //TODO: filter message

    let payerDocumentInfo;
    const payerDocumentType = validateDocument(payer.document);

    if(payerDocumentType === 'CPF') {
      payerDocumentInfo = {
        nome: payer.fullName,
        cpf: payer.document,
      } as DevedorCpf;
    } else {
      payerDocumentInfo = {
        nome: payer.fullName,
        cnpj: payer.document,
      } as DevedorCnpj;
    }

    const pixArgs = {
      calendario: {
        expiracao: 3600,
      },
      chave: chat.user.document,
      devedor: payerDocumentInfo,
      infoAdicionais: [
        {
          nome: "Informações de serviço",
          valor: "Serviço de mensagens ChatPIX."
        },
      ],
      solicitacaoPagador: 'Serviço de mensagens ChatPIX.',
      valor: {
        original: (dto.value / 100).toFixed(2),
      },
    };

    const pixReponse = await this.pixService.createPixCharge(pixArgs);
    const transaction = this.repository.create({
      chat,
      payer,
      txid: pixReponse.txid,
      pixCopiaECola: pixReponse.pixCopiaECola,
      message: dto.message,
      value: dto.value,
      status: TransactionStatus[pixReponse.status],
    });

    await this.repository.save(transaction);

    return new TransactionResponseDTO(transaction);
  }

  async findByPayer(payerId: string) {
    const entities = await this.repository.find({
      where: {
        payerId,
      },
    });

    if (!entities || entities.length === 0) {
      throw new NotFoundException('Can\'t find transactions');
    }
    return entities;
  }

  async findByOwner(ownerId: string) {
    const entities = await this.repository.find({
      where: {
        chat: {
          userId: ownerId,
        },
      },
    });

    if (!entities || entities.length === 0) {
      throw new NotFoundException('Can\'t find transactions');
    }
    return entities;
  }

  async findByOwnerAndChat(ownerId: string, chatId: string) {
    const entities = await this.repository.find({
      where: {
        chatId,
        chat: {
          userId: ownerId,
        },
      },
    });

    if (!entities || entities.length === 0) {
      throw new NotFoundException('Can\'t find transactions');
    }
    return entities;
  }

  async findOneByPayerAndId(payerId: string, transactionId: string) {
    const entity = await this.repository.findOne({
      where: {
        id: transactionId,
        payerId,
      },
    });

    if (!entity) {
      throw new NotFoundException(`Transaction not found`);
    }

    return entity;
  }
}