import { Controller, Get, Post, Body, Param, Req, BadRequestException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransactionResponseDTO } from './dto/transaction-response.dto';
import { isUUID } from 'class-validator';

@ApiTags('Transaction')
@ApiSecurity('Auth')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
  ) {}

  @Post('create')
  async create(
    @Req() req,
    @Body() createTransactionDto: CreateTransactionDTO,
  ) {
    return await this.transactionService.createTransaction(createTransactionDto, req.user.sub);
  }

  @Get('payer')
  async findByPayer(
    @Req() req,
  ) {
    const transactions = await this.transactionService.findByPayer(req.user.sub);
    return transactions.map((transaction) => {
      return new TransactionResponseDTO(transaction);
    });
  }

  @Get('owner')
  async findByOwner(
    @Req() req,
  ) {
    const transactions = await this.transactionService.findByOwner(req.user.sub);
    return transactions.map((transaction) => {
      return new TransactionResponseDTO(transaction);
    });
  }

  @Get('chat/:chatId')
  async findByChat(
    @Req() req,
    @Param('chatId') chatId: string,
  ) {
    if (!isUUID(chatId)) {
      throw new BadRequestException('chatId must be a UUID');
    }
    const transactions = await this.transactionService.findByOwnerAndChat(req.user.sub, chatId);
    return transactions.map((transaction) => {
      return new TransactionResponseDTO(transaction);
    });
  }

  @Get('id/:transactionId')
  async findOne(
    @Req() req,
    @Param('transactionId') transactionId: string,
  ) {
    if (!isUUID(transactionId)) {
      throw new BadRequestException('transactionId must be a UUID');
    }
    const queryResult = await this.transactionService.findOneByPayerAndId(req.user.sub, transactionId);
    return new TransactionResponseDTO(queryResult);
  }
}
