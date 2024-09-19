import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { PixService } from './pix.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/public.guard';
import { TransactionService } from 'src/transaction/transaction.service';

@Controller('pix')
@ApiTags('Pix')
@Public()
export class PixController {
  constructor(
    private readonly pixService: PixService,
    private transacrionService: TransactionService,
  ) {}

  @Post('webhook-efi')
  @HttpCode(HttpStatus.OK)
  async webhookEfiInit(
    @Req() req,
    @Body() body: any,
  ) {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('[POST] /pix/webhook-efi:');
    console.log('Client IP:', clientIp);
    console.log(body);
    return "200";
  }
}
