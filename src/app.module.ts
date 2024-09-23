import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import typeORMConfig from 'db/typeORMConfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { TransactionModule } from './transaction/transaction.module';
import { WalletModule } from './wallet/wallet.module';
import { PixModule } from './pix/pix.module';
import * as Ngrok from 'ngrok';
import { PixService } from './pix/pix.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeORMConfig],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeORMConfig'),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    AuthModule,
    ChatModule,
    PixModule,
    TransactionModule,
    WalletModule,
  ],
})
export class AppModule {
  constructor(
    private pixService: PixService,
    private configService: ConfigService,
  ) {}
  
  async onModuleInit() {
    await this.connectNgrok();
  
    const performRetractablePixCheck = this.configService.get<string>('PERFORM_RETRACTABLE_PIX_CHECK');
    if (performRetractablePixCheck.toLowerCase() === 'true') {
      await this.pixService.performRetractablePixCheck();
    }
  }

  private async connectNgrok() {
    const port = parseInt(this.configService.get<string>('PORT') ?? '3000');
    const env = this.configService.get<string>('NODE_ENV');
    const appEndPoint = this.configService.get<string>('APP_ENDPOINT');

    if (env !== 'production' && !isNaN(port) && !appEndPoint) {
      const url = await Ngrok.connect(port);
      this.configService.set<string>('APP_ENDPOINT', url);
      process.env.APP_ENDPOINT = url;
      console.log("Ngrok URL:", url);
    }
  }
}
