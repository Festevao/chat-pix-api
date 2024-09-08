import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosHeaders, AxiosInstance, isAxiosError } from 'axios';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as NodeCache from 'node-cache';
import { PixApiTokenResponse } from 'src/types/PixApiTokenReponse';
import { CreatePixChargeCnpjParams, CreatePixChargeCpfParams } from 'src/types/PixChargeParams';
import { PixChargeResponse } from 'src/types/PixChargeResponse';

@Injectable()
export class PixService {
  private cache = new NodeCache();
  private readonly cacheKey = 'pix_token';
  private efiCredentials = {
    client_id: '',
    client_secret: '',
  };
  private axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
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
        console.log(e.response.data);
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
        console.log(e.response.data);
      }
      throw e;
    }
  }
}
