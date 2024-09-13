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
import * as Ngrok from 'ngrok';

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
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    this.connectNgrok();
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
