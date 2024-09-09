import { Module } from '@nestjs/common';
import { PixService } from './pix.service';
import { ConfigService } from '@nestjs/config';
import * as Ngrok from 'ngrok';

@Module({
  providers: [PixService],
  exports: [PixService],
})
export class PixModule {
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
