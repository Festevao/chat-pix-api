import { forwardRef, Module } from '@nestjs/common';
import { PixService } from './pix.service';
import { PixController } from './pix.controller';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [forwardRef(() => TransactionModule)],
  controllers: [PixController],
  providers: [PixService],
  exports: [PixService],
})
export class PixModule {}
