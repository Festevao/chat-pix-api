import { Controller } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('Auth')
@ApiTags('Auth')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {
    
  }
}
