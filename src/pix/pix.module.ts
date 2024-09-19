import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { PixService } from './pix.service';
import { PixController } from './pix.controller';
import { TransactionModule } from 'src/transaction/transaction.module';
import { HMACValidationMiddleware } from './middlewares/hmac.middleware';

@Module({
  imports: [forwardRef(() => TransactionModule)],
  controllers: [PixController],
  providers: [PixService],
  exports: [PixService],
})
export class PixModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HMACValidationMiddleware)
      .forRoutes('pix/webhook-efi');
  }
}
