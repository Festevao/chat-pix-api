import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PixService } from './pix.service';

describe('PixService', () => {
  let service: PixService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        isGlobal: true,
      })],
      providers: [PixService],
    }).compile();

    service = module.get<PixService>(PixService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('charge pix group', () => {
    it('should return an cpf PIX charge object', async () => {
      const result = await service.createPixCharge({
        calendario: {
          expiracao: 3600,
        },
        devedor: {
          cpf: "12345678909",
          nome: "Francisco da Silva",
        },
        valor: {
          original: "123.45",
        },
        chave: "71cdf9ba-c695-4e3c-b010-abb521a3f1be",
        solicitacaoPagador: "Cobrança dos serviços prestados.",
      });
  
      expect(result).toBeDefined();
    });

    it('should return an cnpj PIX charge object', async () => {
      const result = await service.createPixCharge({
        calendario: {
          expiracao: 3600
        },
        devedor: {
          cnpj: "12345678000195",
          nome: "Empresa de Serviços SA",
        },
        valor: {
          original: "37.00",
        },
        chave: "ac107ed7-97cd-4fe7-8df5-a5f5659bf2f3",
        solicitacaoPagador: "Serviço realizado.",
        infoAdicionais: [
          {
            nome: "Campo 1",
            valor: "Informação Adicional1 do PSP-Recebedor",
          },
          {
            nome: "Campo 2",
            valor: "Informação Adicional2 do PSP-Recebedor",
          }
        ]
      });
  
      expect(result).toBeDefined();
    });
  });

});
