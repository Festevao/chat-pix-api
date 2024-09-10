export interface Calendario {
  expiracao: number;
}

export interface DevedorCnpj {
  cnpj: string;
  nome: string;
}

export interface DevedorCpf {
  cpf: string;
  nome: string;
}

export interface Valor {
  original: string;
}

export interface InfoAdicionai {
  nome: string;
  valor: string;
}

export interface CreatePixChargeCnpjParams {
  calendario: Calendario;
  devedor: DevedorCnpj;
  valor: Valor;
  chave: string;
  solicitacaoPagador: string;
  infoAdicionais: InfoAdicionai[];
}

export interface CreatePixChargeCpfParams {
  calendario: Calendario;
  devedor: DevedorCpf;
  valor: Valor;
  chave: string;
  solicitacaoPagador: string;
}