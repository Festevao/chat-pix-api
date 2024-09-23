import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosHeaders, AxiosInstance, isAxiosError } from 'axios';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as NodeCache from 'node-cache';
import { PixApiTokenResponse } from 'src/pix/types/PixApiTokenReponse';
import { CreatePixChargeCnpjParams, CreatePixChargeCpfParams } from 'src/pix/types/PixChargeParams';
import { PixChargeResponse } from 'src/pix/types/PixChargeResponse';
import { delay } from 'src/utils/delay';
import { generateHMAC } from 'src/utils/generateHmacHash';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionStatus } from 'src/transaction/types/TransactionStatus';

@Injectable()
export class PixService {
  private cache = new NodeCache();
  private readonly cacheKey = 'pix_token';
  private efiCredentials = {
    client_id: '',
    client_secret: '',
  };
  private axiosInstance: AxiosInstance;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => TransactionService)) 
    private transactionService: TransactionService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    this.efiCredentials.client_id = nodeEnv === 'production'
      ? this.configService.get<string>('EFI_CLIENT_ID_PROD')
      : this.configService.get<string>('EFI_CLIENT_ID_HOMOLOG');
    this.efiCredentials.client_secret = nodeEnv === 'production'
      ? this.configService.get<string>('EFI_CLIENT_SECRET_PROD')
      : this.configService.get<string>('EFI_CLIENT_SECRET_HOMOLOG');

    const certificate = nodeEnv === 'production'
      ? fs.readFileSync(path.join(__dirname, '../../certificates/efi-production.p12'))
      : fs.readFileSync(path.join(__dirname, '../../certificates/efi-homolog.p12'));

    const agent = new https.Agent({
      pfx: certificate,
      passphrase: '',
    });

    this.axiosInstance = axios.create({
      baseURL: nodeEnv === 'production'
        ? this.configService.get<string>('EFI_PRODUCTION_ENDPOINT')
        : this.configService.get<string>('EFI_HOMOLOG_ENDPOINT'),
      httpsAgent: agent,
    });

    this.configWebhooks();
  }

  private async getApiToken() {
    const cachedToken = this.cache.get<PixApiTokenResponse>(this.cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    const data = JSON.stringify({ grant_type: 'client_credentials' });
    const data_credentials = this.efiCredentials.client_id + ':' + this.efiCredentials.client_secret;
    const auth = Buffer.from(data_credentials).toString('base64');

    try {
      const response = await this.axiosInstance.post<PixApiTokenResponse>('/oauth/token', data, {
        timeout: 10000,
        headers: new AxiosHeaders({
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/json',
        }),
      });

      this.cache.set<PixApiTokenResponse>(this.cacheKey, response.data, response.data.expires_in - 10);

      return response.data;
    } catch(e) {
      if (isAxiosError(e)) {
        console.error(e.response.data);
      }
      throw e;
    }
  }

  async createPixCharge(chargeParams: CreatePixChargeCnpjParams | CreatePixChargeCpfParams) {
    try {
      const response = await this.axiosInstance.post<PixChargeResponse>('/v2/cob', chargeParams, {
        timeout: 10000,
        headers: new AxiosHeaders({
          Authorization: 'Bearer ' + (await this.getApiToken()).access_token,
          'Content-Type': 'application/json',
        }),
      });

      return response.data;
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(e.response.data);
      }
      throw e;
    }
  }

  async getPixCharge(txid: string) {
    try {
      const response = await this.axiosInstance.get(`/v2/cob/${txid}`, {
        timeout: 10000,
        headers: new AxiosHeaders({
          Authorization: 'Bearer ' + (await this.getApiToken()).access_token,
          'Content-Type': 'application/json',
        }),
      });

      return response.data;
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(e.response.data);
      }
      throw e;
    }
  }

  async createWebhook() {
    const webhookUrl = `${process.env.APP_ENDPOINT}/pix/webhook-efi`;
    const hmac = generateHMAC(process.env.HMAC_KEY, webhookUrl);
    try {
      await this.axiosInstance.put(`/v2/webhook/${process.env.EFI_PIX_KEY}`,
        {
          webhookUrl: `${process.env.APP_ENDPOINT}/pix/webhook-efi?hmac=${hmac}&ignorar=`,
        },
        {
          timeout: 10000,
          headers: new AxiosHeaders({
            Authorization: 'Bearer ' + (await this.getApiToken()).access_token,
            'Content-Type': 'application/json',
            'x-skip-mtls-checking': true,
          }),
        }
      );
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(e.response.data);
      }
      throw new Error();
    }
  }

  async getWebhooks() {
    try {
      const response = await this.axiosInstance.get(`/v2/webhook?inicio=2024-09-18T20:26:00Z&fim=${new Date().toISOString()}`, {
        timeout: 10000,
        headers: new AxiosHeaders({
          Authorization: 'Bearer ' + (await this.getApiToken()).access_token,
          'Content-Type': 'application/json',
          'x-skip-mtls-checking': true,
        }),
      });

      return response.data.webhooks ?? [];
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(e.response.data);
      }
      throw e;
    }
  }

  async configWebhooks(retryAttempts = 0) {
    await delay(2000);
    if (retryAttempts > 5) {
      console.error('Max retry attempts at efi webhook creation');
      process.exit(1);
    }
    if (!process.env.APP_ENDPOINT) {
      await this.configWebhooks(retryAttempts + 1);
      return;
    }
    await this.createWebhook();
    console.log(await this.getWebhooks());
  }

  async processPixInfo(pixInfo: any) {
    if (!pixInfo.devolucoes) {
      await this.transactionService.updateStatusByTxid(pixInfo.txid, TransactionStatus.CONCLUIDA);
    }
  }

  async handleWebhookMessage(message: any) {
    if (message.pix && Array.isArray(message.pix)) {
      for (const pixInfo of message.pix) {
        if (typeof pixInfo.txid === 'string' && pixInfo.txid.length > 0) {
          await this.processPixInfo(pixInfo);
        }
      }
    }
  }

  async performRetractablePixCheck() {
    const entities = await this.transactionService.findAllActive();

    while(entities.length > 0) {
      const splicedEntities = entities.splice(0, 5);
      await Promise.all(
        splicedEntities.map(async (entity) => {
          try {
            const response = await this.getPixCharge(entity.txid);

            if (
              response
                && typeof response.txid === 'string'
                && response.status === TransactionStatus.CONCLUIDA
                && (
                  !response.pix
                  || (
                    Array.isArray(response.pix)
                      && !(response.pix as any[]).some((pixData) => pixData.devolucoes)
                  )
                )
            ) {
              await this.transactionService.updateStatusByTxid(response.txid, TransactionStatus.CONCLUIDA);
            }
          } catch(e) {
            console.error(`Error on get pix status from txid ${entity.txid}:`);
          }
        })
      );
    }
  }
}
