export interface Calendario {
  criacao: string;
  expiracao: number;
}

export interface Loc {
  id: number;
  location: string;
  tipoCob: string;
}

export interface Devedor {
  cnpj: string;
  nome: string;
}

export interface Valor {
  original: string;
}

export interface PixChargeResponse {
  calendario: Calendario;
  txid: string;
  revisao: number;
  loc: Loc;
  location: string;
  status: string;
  devedor: Devedor;
  valor: Valor;
  chave: string;
  solicitacaoPagador: string;
  pixCopiaECola: string;
}